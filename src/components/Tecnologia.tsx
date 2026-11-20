import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import { useCharacterData } from '@/hooks/useCharacterData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { applySummaryPatchWithWarnings, applySheetPatchWithWarnings } from '@/lib/mergeOverrides';

type ChatRole = 'user' | 'assistant';
interface ChatMsg {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  pending_patch: any | null;
  applied_override_id: string | null;
  created_at: string;
}
interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  created_by_email: string | null;
}

export default function Tecnologia({ isAdmin }: { isAdmin: boolean }) {
  const { summaries, sheets, reload: reloadCharacters } = useCharacterData();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from('tecnologia_chat_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    setSessions((data || []) as ChatSession[]);
    if (!activeSessionId && data && data.length > 0) {
      setActiveSessionId(data[0].id);
    }
  }, [activeSessionId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('tecnologia_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    setMessages((data || []) as ChatMsg[]);
  }, []);

  useEffect(() => { if (isAdmin) loadSessions(); }, [isAdmin, loadSessions]);
  useEffect(() => { if (activeSessionId) loadMessages(activeSessionId); }, [activeSessionId, loadMessages]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center" style={{ color: '#5c3010', fontFamily: "var(--vm-font-heading)" }}>
        🔒 Apenas admins podem acessar a Tecnolog.IA.
      </div>
    );
  }

  const createSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('tecnologia_chat_sessions')
      .insert({ title: 'Nova Solicitação', created_by_email: user?.email ?? null })
      .select('*')
      .single();
    if (error) { toast({ title: 'Erro ao criar sessão', description: error.message, variant: 'destructive' }); return; }
    setSessions(prev => [data as ChatSession, ...prev]);
    setActiveSessionId(data.id);
    setMessages([]);
  };

  const deleteSession = async (id: string) => {
    await supabase.from('tecnologia_chat_messages').delete().eq('session_id', id);
    await supabase.from('tecnologia_chat_sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSessionId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId, session_id: activeSessionId, role: 'user',
      content: text, pending_patch: null, applied_override_id: null,
      created_at: new Date().toISOString(),
    }]);

    try {
      const { buildSessionSummariesText } = await import('@/lib/sessionSummariesText');
      const { data, error } = await supabase.functions.invoke('tecnologia-ia', {
        body: {
          sessionId: activeSessionId,
          userMessage: text,
          characters: summaries.map(s => ({
            ...s,
            sheet: sheets.find(sh => sh.id === s.id) ?? null,
          })),
          sessionSummaries: buildSessionSummariesText(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Reload messages to get persisted IDs
      await loadMessages(activeSessionId);
      // Update session title from first user message
      if (messages.filter(m => m.role === 'user').length === 0) {
        const newTitle = text.slice(0, 40) + (text.length > 40 ? '…' : '');
        await supabase.from('tecnologia_chat_sessions').update({ title: newTitle }).eq('id', activeSessionId);
        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s));
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao enviar', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const applyPatch = async (msg: ChatMsg) => {
    if (!msg.pending_patch || msg.applied_override_id) return;
    setApplyingId(msg.id);
    try {
      // Local dry-run to surface unmatched replaces before persisting
      const charId = msg.pending_patch?.character_id;
      const baseSummary = summaries.find(s => s.id === charId);
      const baseSheet = sheets.find(s => s.id === charId);
      const sumWarn = baseSummary
        ? applySummaryPatchWithWarnings(baseSummary, msg.pending_patch?.summary_patch).warnings
        : [];
      const sheetWarn = baseSheet
        ? applySheetPatchWithWarnings(baseSheet, msg.pending_patch?.sheet_patch).warnings
        : [];
      const allWarn = [...sumWarn, ...sheetWarn];

      const { data, error } = await supabase.functions.invoke('aplicar-tecnologia-patch', {
        body: { messageId: msg.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (allWarn.length > 0) {
        const lines = allWarn.slice(0, 6).map(w => `• ${w.path} → "${w.match}" (${w.reason})`).join('\n');
        toast({
          title: `⚠ Aplicado parcialmente — ${allWarn.length} aviso(s)`,
          description: `Patch persistido, mas alguns itens não bateram:\n${lines}${allWarn.length > 6 ? `\n…e mais ${allWarn.length - 6}` : ''}`,
          variant: 'destructive',
        });
      } else {
        toast({ title: '✓ Alteração aplicada', description: 'A ficha foi atualizada.' });
      }
      await Promise.all([loadMessages(activeSessionId!), reloadCharacters()]);
    } catch (e: any) {
      toast({ title: 'Erro ao aplicar', description: e?.message || '', variant: 'destructive' });
    } finally {
      setApplyingId(null);
    }
  };

  const charName = (id: string) => summaries.find(s => s.id === id)?.name || id;

  return (
    <div className="flex gap-3 h-[75vh]" style={{ fontFamily: "'EB Garamond', serif" }}>
      {/* Sidebar */}
      <div className="w-64 flex flex-col rounded border" style={{ borderColor: '#a07840', background: 'rgba(240,221,176,0.4)' }}>
        <div className="p-3 border-b" style={{ borderColor: '#a07840' }}>
          <Button onClick={createSession} className="w-full" style={{ background: '#5c3010', color: '#f0ddb0' }}>
            + Nova Solicitação
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map(s => (
            <div key={s.id} onClick={() => setActiveSessionId(s.id)}
              className={`p-2.5 border-b cursor-pointer text-sm flex justify-between items-center ${s.id === activeSessionId ? 'font-bold' : ''}`}
              style={{ borderColor: 'rgba(160,120,64,0.3)', background: s.id === activeSessionId ? 'rgba(139,26,26,0.1)' : 'transparent', color: '#3d2010' }}>
              <span className="truncate flex-1">{s.title}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                className="ml-2 text-xs opacity-50 hover:opacity-100" style={{ color: '#9c2620' }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col rounded border" style={{ borderColor: '#a07840', background: 'rgba(245,232,192,0.5)' }}>
        {!activeSessionId ? (
          <div className="flex-1 flex items-center justify-center text-center p-8" style={{ color: '#5c3010' }}>
            <div>
              <div className="text-2xl mb-2" style={{ fontFamily: "var(--vm-font-display)" }}>🛠 Tecnolog.IA</div>
              <p className="text-sm">Crie uma nova solicitação para começar.</p>
              <p className="text-xs mt-3 italic">Ex.: "A DESTREZA de Errich agora é 18, ele ganhou +1 do talento Crossbow Expert."</p>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] rounded p-3 text-sm" style={{
                    background: m.role === 'user' ? 'rgba(139,26,26,0.1)' : 'rgba(160,120,64,0.15)',
                    border: '1px solid', borderColor: m.role === 'user' ? '#9c2620' : '#a07840',
                    color: '#3d2010',
                  }}>
                    <div className="text-[0.6rem] uppercase tracking-wider mb-1 opacity-60" style={{ fontFamily: "var(--vm-font-heading)" }}>
                      {m.role === 'user' ? 'Mestre' : '🛠 Tecnolog.IA'}
                    </div>
                    <div className="prose prose-sm max-w-none" style={{ color: '#3d2010' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                    {m.pending_patch && (
                      <div className="mt-3 p-2 rounded" style={{ background: 'rgba(0,0,0,0.05)', border: '1px dashed #a07840' }}>
                        <div className="text-[0.65rem] font-bold mb-1" style={{ color: '#5c3010' }}>
                          📝 Patch para: <span style={{ color: '#9c2620' }}>{charName(m.pending_patch.character_id)}</span>
                        </div>
                        <details>
                          <summary className="text-[0.65rem] cursor-pointer opacity-70">Ver JSON</summary>
                          <pre className="text-[0.6rem] mt-1 overflow-x-auto whitespace-pre-wrap" style={{ color: '#3d2010' }}>
{JSON.stringify(m.pending_patch, null, 2)}
                          </pre>
                        </details>
                        {m.applied_override_id ? (
                          <div className="mt-2 text-[0.7rem] font-bold" style={{ color: '#2d5a2d' }}>
                            ✓ Aplicado
                          </div>
                        ) : (
                          <Button
                            onClick={() => applyPatch(m)}
                            disabled={applyingId === m.id}
                            className="mt-2"
                            style={{ background: '#9c2620', color: '#f0ddb0', fontSize: '0.75rem' }}
                          >
                            {applyingId === m.id ? 'Aplicando…' : 'Confirmar e Aplicar'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="text-xs italic opacity-60" style={{ color: '#5c3010' }}>Tecnolog.IA pensando…</div>
              )}
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: '#a07840' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Descreva a alteração desejada (ex.: 'A DESTREZA de Errich agora é 18')…"
                rows={2}
                disabled={sending}
                className="flex-1 rounded p-2 text-sm resize-none"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid #a07840', color: '#3d2010' }}
              />
              <Button onClick={sendMessage} disabled={sending || !input.trim()} style={{ background: '#5c3010', color: '#f0ddb0' }}>
                Enviar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
