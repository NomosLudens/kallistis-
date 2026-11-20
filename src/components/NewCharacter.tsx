import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import { useCharacterData } from '@/hooks/useCharacterData';
import CombatHighlight from '@/components/CombatHighlight';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, StepProgress, ChatBubble, type VmStatusTone } from '@/components/fantasy';

const CREATE_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-personagem-ia`;

// Etapas guiadas da criação (derivadas de draft.currentStep, de forma tolerante)
const CREATION_STEPS: { key: string; label: string; match: string[] }[] = [
  { key: 'concept', label: 'Conceito', match: ['concept', 'conceito', 'ideia', 'inicio', 'início', 'start'] },
  { key: 'race', label: 'Raça', match: ['race', 'raça', 'raca', 'subrace', 'origem', 'ancestral'] },
  { key: 'class', label: 'Classe', match: ['class', 'classe', 'subclass', 'subclasse'] },
  { key: 'abilities', label: 'Atributos', match: ['abilit', 'atribut', 'ability', 'score', 'stats'] },
  { key: 'skills', label: 'Perícias', match: ['skill', 'perícia', 'pericia', 'proficien', 'background', 'antecedente'] },
  { key: 'powers', label: 'Talentos & Magias', match: ['feat', 'talento', 'spell', 'magia', 'truque', 'cantrip', 'poder'] },
  { key: 'equipment', label: 'Equipamento', match: ['equip', 'gear', 'item', 'inventár', 'inventar', 'ouro', 'gold'] },
  { key: 'story', label: 'História', match: ['story', 'históri', 'histori', 'backstory', 'vínculo', 'vinculo', 'narrativa', 'personalidade'] },
  { key: 'review', label: 'Revisão', match: ['review', 'revis', 'final', 'pronto', 'conclu'] },
];

function creationStepIndex(currentStep?: string): number {
  if (!currentStep) return 0;
  const s = String(currentStep).toLowerCase();
  const idx = CREATION_STEPS.findIndex(st => st.match.some(m => s.includes(m)));
  return idx === -1 ? 0 : idx;
}

const STATUS_TONE: Record<CreationStatus, VmStatusTone> = {
  in_progress: 'progress',
  submitted: 'warn',
  approved: 'ok',
  rejected: 'danger',
};

type CreationStatus = 'in_progress' | 'submitted' | 'approved' | 'rejected';

interface CreatedCharacter {
  id: string;
  created_by_email: string | null;
  name: string;
  target_level: number;
  status: CreationStatus;
  draft_data: any;
  published_character_id: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const STATUS_LABEL: Record<CreationStatus, string> = {
  in_progress: 'Em criação',
  submitted: 'Aguardando mestre',
  approved: 'Publicado',
  rejected: 'Rejeitado',
};
const STATUS_COLOR: Record<CreationStatus, string> = {
  in_progress: '#7da3c9',
  submitted: '#c3a45e',
  approved: '#9bc97d',
  rejected: '#c97d7d',
};

export default function NewCharacter({ isAdmin }: { isAdmin: boolean }) {
  const { reload: reloadCharacterData } = useCharacterData();
  const [creations, setCreations] = useState<CreatedCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCreation, setActiveCreation] = useState<CreatedCharacter | null>(null);
  const [reviewCreation, setReviewCreation] = useState<CreatedCharacter | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<CreatedCharacter | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('created_characters')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setCreations((data || []) as unknown as CreatedCharacter[]);
    } catch (e) {
      console.error('Failed to load created_characters', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [loadAll]);

  const myCreations = useMemo(
    () => creations.filter(c => c.status !== 'approved'),
    [creations],
  );
  const pendingReview = useMemo(
    () => creations.filter(c => c.status === 'submitted'),
    [creations],
  );
  const approved = useMemo(
    () => creations.filter(c => c.status === 'approved'),
    [creations],
  );

  const createNew = async () => {
    try {
      const { data, error } = await supabase
        .from('created_characters')
        .insert({
          name: newName.trim() || 'Novo Personagem',
          target_level: newLevel,
          status: 'in_progress',
          draft_data: { name: newName.trim() || undefined, level: newLevel, currentStep: 'concept' },
          created_by_email: userEmail,
        })
        .select()
        .single();
      if (error) throw error;
      setShowCreateModal(false);
      setNewName('');
      setNewLevel(1);
      await loadAll();
      setActiveCreation(data as unknown as CreatedCharacter);
    } catch (e) {
      console.error('createNew failed', e);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await supabase.from('created_characters').delete().eq('id', confirmDelete.id);
      setConfirmDelete(null);
      await loadAll();
    } catch (e) { console.error('delete failed', e); }
  };

  // ===== Chat mode =====
  if (activeCreation) {
    return (
      <NewCharacterChat
        creation={activeCreation}
        onExit={async () => { setActiveCreation(null); await loadAll(); }}
      />
    );
  }

  // ===== Admin review mode =====
  if (reviewCreation) {
    return (
      <AdminReviewCreation
        creation={reviewCreation}
        onExit={async () => { setReviewCreation(null); await Promise.all([loadAll(), reloadCharacterData()]); }}
      />
    );
  }

  // ===== List mode =====
  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--vm-font-heading)', fontSize: 32, color: '#c3a45e', margin: 0 }}>🎭 Forjar Novo Personagem</h1>
          <p style={{ color: '#8c8478', marginTop: 6, fontSize: 14, maxWidth: 700 }}>
            Crie personagens completos de D&D 5.5e (2024) em um chat guiado pelo Grok. O processo cobre raça, classe, antecedente, atributos, perícias, talentos, magias, equipamentos, item mágico e história. Tudo é salvo automaticamente — você pode pausar e continuar depois. Quando finalizar, o mestre revisa e publica nas abas do app.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          style={{ background: '#c3a45e', color: '#0d0d12', border: 'none', whiteSpace: 'nowrap' }}
        >
          + Criar Novo Personagem
        </Button>
      </div>

      {loading ? (
        <div style={{ color: '#8c8478', textAlign: 'center', padding: 40 }}>Carregando...</div>
      ) : (
        <>
          {/* Admin: pending validation */}
          {isAdmin && pendingReview.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--vm-font-heading)', fontSize: 20, color: '#c3a45e', borderBottom: '1px solid rgba(201,148,58,0.3)', paddingBottom: 6 }}>
                📜 Aguardando Validação ({pendingReview.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 12 }}>
                {pendingReview.map(c => (
                  <CreationCard
                    key={c.id}
                    creation={c}
                    onAction={() => setReviewCreation(c)}
                    actionLabel="Revisar e Publicar"
                    onDelete={() => setConfirmDelete(c)}
                    showEmail={isAdmin}
                  />
                ))}
              </div>
            </section>
          )}

          {/* My creations (or all in_progress for admin) */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--vm-font-heading)', fontSize: 20, color: '#c3a45e', borderBottom: '1px solid rgba(201,148,58,0.3)', paddingBottom: 6 }}>
              🪶 Meus Personagens em Criação
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 12 }}>
              {myCreations.length === 0 && (
                <div style={{ gridColumn: '1 / -1', color: '#8c8478', fontStyle: 'italic', padding: 20, textAlign: 'center' }}>
                  Nenhum personagem em criação. Clique em "+ Criar Novo Personagem" para começar.
                </div>
              )}
              {myCreations.map(c => (
                <CreationCard
                  key={c.id}
                  creation={c}
                  onAction={() => {
                    if (c.status === 'in_progress' || c.status === 'rejected') setActiveCreation(c);
                    else if (c.status === 'submitted' && isAdmin) setReviewCreation(c);
                  }}
                  actionLabel={
                    c.status === 'in_progress' ? 'Continuar'
                      : c.status === 'rejected' ? 'Retomar'
                      : isAdmin ? 'Revisar' : 'Aguardando mestre'
                  }
                  actionDisabled={c.status === 'submitted' && !isAdmin}
                  onDelete={isAdmin ? () => setConfirmDelete(c) : undefined}
                  showEmail={isAdmin}
                />
              ))}
            </div>
          </section>

          {/* Approved (read-only) */}
          {approved.length > 0 && (
            <section>
              <h2 style={{ fontFamily: 'var(--vm-font-heading)', fontSize: 20, color: '#9bc97d', borderBottom: '1px solid rgba(155,201,125,0.3)', paddingBottom: 6 }}>
                ✓ Personagens Publicados ({approved.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 12 }}>
                {approved.map(c => (
                  <CreationCard
                    key={c.id}
                    creation={c}
                    actionLabel="Publicado"
                    actionDisabled
                    onDelete={isAdmin ? () => setConfirmDelete(c) : undefined}
                    showEmail={isAdmin}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Create modal */}
      <Dialog open={showCreateModal} onOpenChange={(o) => !o && setShowCreateModal(false)}>
        <DialogContent style={{ background: '#17161f', border: '1px solid rgba(201,148,58,0.4)', color: '#c3a45e' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>Criar Novo Personagem</DialogTitle>
            <DialogDescription style={{ color: '#8c8478' }}>
              Defina o nome (opcional) e o nível inicial. Você poderá ajustar tudo no chat.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '8px 0' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#a29a88', fontSize: 13 }}>Nome (opcional)</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Lyara Cinzentina"
                style={{
                  width: '100%', padding: '8px 10px',
                  background: '#08080c', border: '1px solid rgba(201,148,58,0.3)',
                  color: '#d4c4a8', borderRadius: 6, fontSize: 14, outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: '#a29a88', fontSize: 13 }}>Nível alvo</label>
              <Select value={String(newLevel)} onValueChange={(v) => setNewLevel(parseInt(v, 10))}>
                <SelectTrigger style={{ background: '#08080c', borderColor: 'rgba(201,148,58,0.3)', color: '#d4c4a8' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#17161f', borderColor: 'rgba(201,148,58,0.4)' }}>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(lv => (
                    <SelectItem key={lv} value={String(lv)} style={{ color: '#c3a45e' }}>Nível {lv}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={createNew} style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
              Iniciar Criação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent style={{ background: '#17161f', border: '1px solid rgba(201,148,58,0.4)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>Excluir personagem?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#8c8478' }}>
              "{confirmDelete?.name}" será removido permanentemente, incluindo todas as mensagens do chat de criação. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} style={{ background: '#9c2620', color: '#f0ddb0' }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===================== CARD =====================
function CreationCard({
  creation, onAction, actionLabel, actionDisabled, onDelete, showEmail,
}: {
  creation: CreatedCharacter;
  onAction?: () => void;
  actionLabel: string;
  actionDisabled?: boolean;
  onDelete?: () => void;
  showEmail?: boolean;
}) {
  const draft = creation.draft_data || {};
  const displayName = draft.name || creation.name || 'Sem nome';
  const race = draft.race || (draft.subrace ? `${draft.race ?? ''} ${draft.subrace}` : '—');
  const classInfo = draft.classInfo || (draft.className ? `${draft.className}${draft.subclass ? ` (${draft.subclass})` : ''}` : '—');
  const step = draft.currentStep || '—';

  return (
    <div style={{
      border: '1px solid rgba(201,148,58,0.3)',
      borderRadius: 8,
      background: 'rgba(15,12,9,0.6)',
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--vm-font-heading)', color: '#c3a45e', margin: 0, fontSize: 17 }}>{displayName}</h3>
          <div style={{ color: '#8c8478', fontSize: 12, marginTop: 2 }}>
            {race} · {classInfo}
          </div>
          <div style={{ color: '#605a4e', fontSize: 11, marginTop: 2 }}>
            Nv alvo: {creation.target_level} · Etapa: {step}
          </div>
          {showEmail && creation.created_by_email && (
            <div style={{ color: '#605a4e', fontSize: 10, marginTop: 2 }}>
              {creation.created_by_email}
            </div>
          )}
        </div>
        <StatusBadge tone={STATUS_TONE[creation.status]}>{STATUS_LABEL[creation.status]}</StatusBadge>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {onAction && (
          <Button
            size="sm"
            onClick={onAction}
            disabled={actionDisabled}
            style={{
              background: actionDisabled ? 'transparent' : '#c3a45e',
              color: actionDisabled ? '#8c8478' : '#0d0d12',
              border: actionDisabled ? '1px solid rgba(201,148,58,0.3)' : 'none',
            }}
          >
            {actionLabel}
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            style={{ borderColor: '#c97d7d', color: '#c97d7d' }}
          >
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}

// ===================== CHAT =====================
function NewCharacterChat({
  creation, onExit,
}: {
  creation: CreatedCharacter;
  onExit: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(creation.status === 'submitted');
  const [bootstrapped, setBootstrapped] = useState(false);
  const [draft, setDraft] = useState<any>(creation.draft_data || {});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('character_creation_messages')
          .select('*')
          .eq('creation_id', creation.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        const loaded = (data || []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
        setMessages(loaded);
      } catch (e) {
        console.error('Failed to load creation history', e);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [creation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  // Auto-send the initial greeting if no history yet
  useEffect(() => {
    if (!bootstrapped) return;
    if (messages.length === 0 && !isLoading && !submitted) {
      sendMessage('Olá! Estou pronto para começar a criar meu personagem.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped]);

  const persistDraft = useCallback(async (delta: any) => {
    const merged = { ...draft, ...delta };
    setDraft(merged);
    try {
      const updates: any = { draft_data: merged };
      if (delta.name && typeof delta.name === 'string') updates.name = delta.name;
      await supabase.from('created_characters').update(updates).eq('id', creation.id);
    } catch (e) {
      console.error('persistDraft failed', e);
    }
  }, [draft, creation.id]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading || submitted) return;
    if (!overrideText) setInput('');

    const userMsg: ChatMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      await supabase.from('character_creation_messages').insert({
        creation_id: creation.id, role: 'user', content: text,
      });
    } catch (e) { console.error('persist user msg', e); }

    let assistant = '';
    try {
      const resp = await fetch(CREATE_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updated,
          targetLevel: creation.target_level,
          draftData: draft,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: `Erro ${resp.status}` }));
        throw new Error(err.error || `Erro ${resp.status}`);
      }
      if (!resp.body) throw new Error('Stream indisponível');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistant += delta;
              setMessages([...updated, { role: 'assistant', content: assistant }]);
            }
          } catch { /* partial */ }
        }
      }

      if (assistant) {
        await supabase.from('character_creation_messages').insert({
          creation_id: creation.id, role: 'assistant', content: assistant,
        });

        // Parse [DRAFT_UPDATE]{...}[/DRAFT_UPDATE] blocks and merge
        const draftMatches = Array.from(assistant.matchAll(/\[DRAFT_UPDATE\]([\s\S]*?)\[\/DRAFT_UPDATE\]/g));
        for (const m of draftMatches) {
          try {
            const delta = JSON.parse(m[1].trim());
            if (delta && typeof delta === 'object') {
              await persistDraft(delta);
            }
          } catch (e) {
            console.warn('Could not parse DRAFT_UPDATE block', m[1], e);
          }
        }

        // Detect finalization
        if (assistant.includes('[FINALIZAR_PERSONAGEM]')) {
          try {
            await supabase.from('created_characters').update({
              status: 'submitted',
              submitted_at: new Date().toISOString(),
            }).eq('id', creation.id);
            setSubmitted(true);
          } catch (e) { console.error('finalize failed', e); }
        }
      }
    } catch (e: any) {
      const errMsg = `⚠️ ${e.message || 'Erro ao conectar com a IA'}`;
      setMessages([...updated, { role: 'assistant', content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, submitted, messages, creation, draft, persistDraft]);

  const lastAssistant = messages[messages.length - 1];
  const suggestions = useMemo(() => {
    if (!lastAssistant || lastAssistant.role !== 'assistant' || isLoading) return [];
    const matches = Array.from(lastAssistant.content.matchAll(/\[OPÇÃO:\s*([^\]]+?)\]/g));
    return matches.map(m => m[1].trim());
  }, [lastAssistant, isLoading]);

  const renderContent = (content: string) => {
    const cleaned = content
      .replace(/\[OPÇÃO:[^\]]+\]/g, '')
      .replace(/\[DRAFT_UPDATE\][\s\S]*?\[\/DRAFT_UPDATE\]/g, '')
      .replace(/\[FINALIZAR_PERSONAGEM\]/g, '')
      .trim();
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: 'var(--vm-panel-3)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid rgba(201,148,58,0.3)',
        background: 'linear-gradient(180deg, var(--vm-ink) 0%, var(--vm-panel) 100%)', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--vm-gold)', fontFamily: 'var(--vm-font-heading)', fontSize: 16, fontWeight: 600 }}>
              🎭 Forjar Personagem — {draft.name || creation.name || 'Novo'}
            </div>
            <div style={{ color: 'var(--vm-gold-dim)', fontSize: 12, marginTop: 2 }}>
              Nível alvo: {creation.target_level}
              {submitted && ' · ✓ Enviado ao mestre'}
              {!submitted && ' · 💾 Salvamento automático ativo'}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onExit}
            style={{ borderColor: 'rgba(201,148,58,0.4)', color: 'var(--vm-gold)' }}>
            ← Voltar
          </Button>
        </div>
        {!submitted && (
          <div className="overflow-x-auto pb-1">
            <StepProgress steps={CREATION_STEPS.map(s => ({ key: s.key, label: s.label }))} currentIndex={creationStepIndex(draft.currentStep)} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Draft summary side panel */}
        <aside style={{
          width: 240, minWidth: 240, borderRight: '1px solid rgba(201,148,58,0.2)',
          background: '#0d0a08', overflow: 'auto', padding: 14, display: 'none',
        }} className="md:!block">
          <div style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Rascunho
          </div>
          <DraftSummary draft={draft} />
        </aside>

        {/* Chat messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role}>
                {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              </ChatBubble>
            ))}
            {isLoading && (
              <div style={{ color: '#8c8478', fontStyle: 'italic', fontSize: 13, padding: 8 }}>
                ⏳ O Forjador está pensando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {!submitted && suggestions.length > 0 && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(201,148,58,0.2)', background: '#0d0a08' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                disabled={isLoading}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(201,148,58,0.1)',
                  border: '1px solid rgba(201,148,58,0.4)',
                  color: '#c3a45e',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = 'rgba(201,148,58,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,148,58,0.1)'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input or submitted state */}
      {submitted ? (
        <div style={{
          padding: 20, textAlign: 'center', borderTop: '1px solid rgba(201,148,58,0.3)',
          background: '#0d0d12',
        }}>
          <div style={{ color: '#9bc97d', fontFamily: 'var(--vm-font-heading)', fontSize: 16, marginBottom: 6 }}>
            ✓ Personagem enviado ao mestre
          </div>
          <div style={{ color: '#8c8478', fontSize: 13, marginBottom: 12 }}>
            O mestre revisará e publicará seu personagem nas abas do app.
          </div>
          <Button onClick={onExit} style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
            Voltar ao Painel
          </Button>
        </div>
      ) : (
        <div style={{ padding: 12, borderTop: '1px solid rgba(201,148,58,0.3)', background: '#0d0d12' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Digite sua resposta ou clique em uma sugestão..."
              disabled={isLoading}
              rows={2}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#08080c',
                border: '1px solid rgba(201,148,58,0.3)',
                color: '#d4c4a8',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
              }}
            />
            <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
              style={{ background: '#c3a45e', color: '#0d0d12', border: 'none', alignSelf: 'stretch' }}>
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== DRAFT SUMMARY =====================
function DraftSummary({ draft }: { draft: any }) {
  const rows: { label: string; value?: string }[] = [
    { label: 'Nome', value: draft.name },
    { label: 'Raça', value: draft.subrace ? `${draft.race ?? ''} (${draft.subrace})` : draft.race },
    { label: 'Classe', value: draft.classInfo || draft.className },
    { label: 'Subclasse', value: draft.subclass },
    { label: 'Nível', value: draft.level ? String(draft.level) : undefined },
    { label: 'Antecedente', value: draft.background },
    { label: 'Alinhamento', value: draft.alignment },
    { label: 'CA', value: draft.ac ? String(draft.ac) : undefined },
    { label: 'PV', value: draft.hp ? String(draft.hp) : undefined },
    { label: 'Iniciativa', value: draft.initiative },
  ];

  const ab = draft.abilities;
  const abilityRow = ab && typeof ab === 'object'
    ? ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR']
        .map(k => ab[k] !== undefined ? `${k} ${ab[k]}` : null)
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
      {rows.filter(r => r.value).map((r, i) => (
        <div key={i}>
          <div style={{ color: '#605a4e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {r.label}
          </div>
          <div style={{ color: '#d4c4a8' }}>{r.value}</div>
        </div>
      ))}
      {abilityRow && (
        <div>
          <div style={{ color: '#605a4e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Atributos
          </div>
          <div style={{ color: '#d4c4a8', fontSize: 11 }}>{abilityRow}</div>
        </div>
      )}
      {draft.currentStep && (
        <div style={{ marginTop: 8, padding: 8, borderRadius: 4, background: 'rgba(201,148,58,0.1)', border: '1px dashed rgba(201,148,58,0.3)' }}>
          <div style={{ color: '#c3a45e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Etapa atual
          </div>
          <div style={{ color: '#d4c4a8', fontSize: 11 }}>{draft.currentStep}</div>
        </div>
      )}
      {Object.keys(draft).filter(k => !['name','race','subrace','classInfo','className','subclass','level','background','alignment','ac','hp','initiative','abilities','currentStep'].includes(k)).length > 0 && (
        <div style={{ marginTop: 8, color: '#605a4e', fontSize: 10, fontStyle: 'italic' }}>
          + outros dados salvos
        </div>
      )}
    </div>
  );
}

// ===================== ADMIN REVIEW =====================
function AdminReviewCreation({
  creation, onExit,
}: {
  creation: CreatedCharacter;
  onExit: () => void;
}) {
  const [draftJson, setDraftJson] = useState(JSON.stringify(creation.draft_data || {}, null, 2));
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('character_creation_messages')
        .select('role, content')
        .eq('creation_id', creation.id)
        .order('created_at', { ascending: true });
      setChatMessages((data || []).map(m => ({ role: m.role as any, content: m.content })));
    })();
  }, [creation.id]);

  const validateJson = (text: string): any | null => {
    try {
      const parsed = JSON.parse(text);
      setParseError(null);
      return parsed;
    } catch (e: any) {
      setParseError(e.message);
      return null;
    }
  };

  const saveDraft = async () => {
    const parsed = validateJson(draftJson);
    if (!parsed) return;
    setSaving(true);
    setError(null);
    try {
      await supabase.from('created_characters').update({
        draft_data: parsed,
        name: parsed.name || creation.name,
      }).eq('id', creation.id);
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setError(null);
    setConfirmPublish(false);
    try {
      // Save current edits first
      const parsed = validateJson(draftJson);
      if (parsed) {
        await supabase.from('created_characters').update({
          draft_data: parsed,
          name: parsed.name || creation.name,
        }).eq('id', creation.id);
      }
      const { data, error } = await supabase.functions.invoke('publicar-personagem', {
        body: { creationId: creation.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onExit();
    } catch (e: any) {
      setError(e.message || 'Falha ao publicar');
    } finally {
      setPublishing(false);
    }
  };

  const reject = async () => {
    setConfirmReject(false);
    try {
      await supabase.from('created_characters').update({
        status: 'rejected',
      }).eq('id', creation.id);
      onExit();
    } catch (e: any) {
      setError(e.message || 'Falha ao rejeitar');
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--vm-font-heading)', fontSize: 24, color: '#c3a45e', margin: 0 }}>
            📜 Revisar Personagem — {creation.name}
          </h1>
          <div style={{ color: '#8c8478', fontSize: 13, marginTop: 4 }}>
            Nível alvo: {creation.target_level} · Jogador: {creation.created_by_email || '—'}
          </div>
        </div>
        <Button variant="outline" onClick={onExit} style={{ borderColor: 'rgba(201,148,58,0.4)', color: '#c3a45e' }}>
          ← Voltar
        </Button>
      </div>

      {error && (
        <div style={{ padding: 10, background: 'rgba(139,26,26,0.2)', border: '1px solid #9c2620', color: '#f0a0a0', borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Visual character sheet preview */}
      <DraftFicha draft={(() => { try { return JSON.parse(draftJson); } catch { return creation.draft_data || {}; } })()} />

      {/* Advanced: raw JSON editor */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button style={{
            marginTop: 16, width: '100%', padding: '10px 14px', textAlign: 'left',
            background: 'rgba(15,12,9,0.6)', border: '1px solid rgba(201,148,58,0.3)',
            borderRadius: 8, color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 13,
            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>▾ Editar JSON bruto (avançado)</span>
            <span style={{ color: '#8c8478', fontSize: 11 }}>
              {parseError ? '⚠️ JSON inválido' : 'clique para expandir'}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <section style={{ background: 'rgba(15,12,9,0.6)', border: '1px solid rgba(201,148,58,0.3)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', margin: 0, fontSize: 15 }}>Dados do Rascunho (JSON)</h3>
              <Button size="sm" onClick={saveDraft} disabled={saving || !!parseError}
                style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
                {saving ? 'Salvando...' : '💾 Salvar Ajustes'}
              </Button>
            </div>
            <div style={{ padding: 10, background: 'rgba(201,148,58,0.08)', border: '1px solid rgba(201,148,58,0.25)', color: '#a29a88', borderRadius: 6, marginBottom: 10, fontSize: 11, lineHeight: 1.5 }}>
              💡 <strong>Dica:</strong> se o JSON estiver vazio ou incompleto, ao publicar a IA também consulta o histórico do chat para reconstruir o personagem.
            </div>
            <textarea
              value={draftJson}
              onChange={(e) => { setDraftJson(e.target.value); validateJson(e.target.value); }}
              spellCheck={false}
              style={{
                width: '100%', height: 400,
                background: '#08080c', border: `1px solid ${parseError ? '#9c2620' : 'rgba(201,148,58,0.3)'}`,
                color: '#d4c4a8', borderRadius: 6, padding: 10,
                fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, lineHeight: 1.5,
                outline: 'none', resize: 'vertical',
              }}
            />
            {parseError && (
              <div style={{ color: '#f0a0a0', fontSize: 11, marginTop: 6 }}>JSON inválido: {parseError}</div>
            )}
          </section>
        </CollapsibleContent>
      </Collapsible>

      {/* Chat history */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button style={{
            marginTop: 12, width: '100%', padding: '10px 14px', textAlign: 'left',
            background: 'rgba(15,12,9,0.6)', border: '1px solid rgba(201,148,58,0.3)',
            borderRadius: 8, color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 13,
            cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>▾ Ver histórico do chat de criação</span>
            <span style={{ color: '#8c8478', fontSize: 11 }}>
              {chatMessages.length} mensagem{chatMessages.length === 1 ? '' : 's'}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <section style={{ background: 'rgba(15,12,9,0.6)', border: '1px solid rgba(201,148,58,0.3)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 14 }}>
            <div style={{ maxHeight: 540, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chatMessages.length === 0 && (
                <div style={{ color: '#8c8478', fontStyle: 'italic', fontSize: 12 }}>(sem mensagens)</div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} style={{
                  padding: '8px 10px',
                  background: m.role === 'user' ? 'rgba(201,148,58,0.1)' : 'rgba(20,16,12,0.7)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(201,148,58,0.3)' : 'rgba(201,148,58,0.15)'}`,
                  color: '#d4c4a8', borderRadius: 6, fontSize: 12, lineHeight: 1.5,
                }} className="prose prose-invert prose-sm max-w-none">
                  <div style={{ color: '#c3a45e', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                    {m.role === 'user' ? 'Jogador' : 'Forjador'}
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content
                      .replace(/\[OPÇÃO:[^\]]+\]/g, '')
                      .replace(/\[DRAFT_UPDATE\][\s\S]*?\[\/DRAFT_UPDATE\]/g, '')
                      .replace(/\[FINALIZAR_PERSONAGEM\]/g, '')
                      .trim()}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </section>
        </CollapsibleContent>
      </Collapsible>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={() => setConfirmReject(true)}
          style={{ borderColor: '#c97d7d', color: '#c97d7d' }}>
          ✕ Rejeitar
        </Button>
        <Button onClick={() => setConfirmPublish(true)} disabled={publishing || !!parseError}
          style={{ background: '#9bc97d', color: '#0d0d12', border: 'none' }}>
          {publishing ? '🪄 Publicando via Grok...' : '✓ Validar e Publicar Personagem'}
        </Button>
      </div>

      <AlertDialog open={confirmPublish} onOpenChange={(o) => !o && setConfirmPublish(false)}>
        <AlertDialogContent style={{ background: '#17161f', border: '1px solid rgba(201,148,58,0.4)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>Publicar personagem?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#8c8478' }}>
              O Grok converterá o rascunho em uma ficha completa e a adicionará às abas do app (Resumo do Grupo + nova aba individual). Você poderá editar depois via overrides.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={publish} style={{ background: '#9bc97d', color: '#0d0d12' }}>
              Publicar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReject} onOpenChange={(o) => !o && setConfirmReject(false)}>
        <AlertDialogContent style={{ background: '#17161f', border: '1px solid rgba(201,148,58,0.4)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>Rejeitar personagem?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#8c8478' }}>
              O personagem voltará ao status "Rejeitado" e o jogador poderá retomar a criação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={reject} style={{ background: '#9c2620', color: '#f0ddb0' }}>
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===================== DRAFT FICHA (visual sheet) =====================
function fmtMod(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function fieldOrDash(v: any): string {
  if (v === undefined || v === null || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v);
}

function Section({ title, children, accent = '#c3a45e' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <section style={{
      background: 'rgba(15,12,9,0.6)',
      border: '1px solid rgba(201,148,58,0.3)',
      borderRadius: 8,
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <h3 style={{
        margin: 0, color: accent, fontFamily: 'var(--vm-font-heading)',
        fontSize: 13, textTransform: 'uppercase', letterSpacing: 1,
        borderBottom: `1px solid ${accent}33`, paddingBottom: 4,
      }}>{title}</h3>
      <div style={{ color: '#d4c4a8', fontSize: 13, lineHeight: 1.55 }}>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  const display = value === undefined || value === null || value === '' ? '—' : value;
  const isDash = display === '—';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: 13 }}>
      <span style={{ color: '#a29a88', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ color: isDash ? '#605a4e' : '#d4c4a8', fontStyle: isDash ? 'italic' : 'normal', textAlign: 'right' }}>
        {Array.isArray(display) ? display.join(', ') : String(display)}
      </span>
    </div>
  );
}

function Chip({ children, color = '#c3a45e' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 4,
      background: `${color}1a`, border: `1px solid ${color}55`,
      color, fontSize: 11, marginRight: 4, marginBottom: 4,
    }}>{children}</span>
  );
}

function asArray(v: any): any[] {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  if (typeof v === 'object') return Object.values(v);
  return [String(v)];
}

function DraftFicha({ draft }: { draft: any }) {
  const d = draft || {};

  // Identity
  const name = d.name || '—';
  const race = d.subrace ? `${d.race ?? ''} (${d.subrace})`.trim() : (d.race || '—');
  const classInfo = d.classInfo || (d.className ? `${d.className}${d.subclass ? ` (${d.subclass})` : ''}` : '—');
  const level = d.level ?? d.targetLevel ?? '—';
  const background = d.background || '—';
  const alignment = d.alignment || '—';
  const languages = asArray(d.languages);

  // Combat
  const ac = d.ac ?? d.armorClass;
  const hp = d.hp ?? d.hitPoints;
  const initiative = d.initiative;
  const profBonus = d.proficiencyBonus ?? d.profBonus;
  const speed = d.speed;

  // Attributes
  const ab = d.abilities || d.attributes || {};
  const abilityKeys = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  const abMap: Record<string, number> = {};
  abilityKeys.forEach(k => {
    const v = ab[k] ?? ab[k.toLowerCase()] ?? ab[
      ({ FOR: 'STR', DES: 'DEX', CON: 'CON', INT: 'INT', SAB: 'WIS', CAR: 'CHA' } as any)[k]
    ];
    if (typeof v === 'number') abMap[k] = v;
  });
  const hasAttrs = Object.keys(abMap).length > 0;

  // Skills
  const skills = asArray(d.skills || d.proficientSkills);

  // Features / traits
  const racialTraits = asArray(d.racialTraits || d.raceFeatures);
  const classFeatures = asArray(d.classFeatures || d.features);
  const feats = asArray(d.feats);

  // Spells
  const cantrips = asArray(d.cantrips);
  const spells = asArray(d.spells || d.spellsKnown || d.preparedSpells);
  const spellSlots = d.spellSlots || d.slots;
  const spellcastingAbility = d.spellcastingAbility;
  const spellSaveDC = d.spellSaveDC;
  const spellAttackBonus = d.spellAttackBonus;

  // Equipment
  const equipment = asArray(d.equipment || d.gear || d.startingEquipment);
  const gold = d.gold ?? d.gp;
  const magicItem = d.magicItem || d.magicalItem;

  // Narrative
  const personalityTrait = d.personalityTrait || d.trait;
  const ideal = d.ideal;
  const bond = d.bond;
  const flaw = d.flaw;
  const backstory = d.backstory || d.history;

  const hasSpells = cantrips.length > 0 || spells.length > 0 || spellSlots || spellcastingAbility;

  // CombatHighlight data — only render if AC or HP are present
  const highlightData = (ac || hp) ? {
    ac: fieldOrDash(ac),
    hp: fieldOrDash(hp),
    spellAttack: spellAttackBonus ? String(spellAttackBonus) : undefined,
    spellDC: spellSaveDC ? String(spellSaveDC) : undefined,
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(201,148,58,0.15), rgba(201,148,58,0.05))',
        border: '1px solid rgba(201,148,58,0.4)',
        borderRadius: 8, padding: 16,
      }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--vm-font-heading)', color: '#e2c98f', fontSize: 22 }}>{name}</h2>
        <div style={{ color: '#a29a88', fontSize: 13, marginTop: 4 }}>
          {race} · {classInfo} · Nv {level}
        </div>
        {background && background !== '—' && (
          <div style={{ color: '#8c8478', fontSize: 12, marginTop: 2 }}>Antecedente: {background}</div>
        )}
      </div>

      {/* Combat highlight */}
      {highlightData && <CombatHighlight data={highlightData} />}

      {/* Identity + Attributes side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <Section title="Identidade">
          <Row label="Raça" value={race} />
          <Row label="Classe" value={classInfo} />
          <Row label="Antecedente" value={background} />
          <Row label="Alinhamento" value={alignment} />
          <Row label="Idiomas" value={languages.length ? languages : '—'} />
          <Row label="Deslocamento" value={speed} />
          <Row label="Iniciativa" value={initiative} />
          <Row label="Bônus de Proficiência" value={profBonus} />
        </Section>

        <Section title="Atributos">
          {hasAttrs ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {abilityKeys.map(k => (
                <div key={k} style={{
                  textAlign: 'center', padding: 8, borderRadius: 6,
                  background: 'rgba(201,148,58,0.08)', border: '1px solid rgba(201,148,58,0.3)',
                }}>
                  <div style={{ fontSize: 10, color: '#a29a88', fontFamily: 'var(--vm-font-heading)', letterSpacing: 0.5 }}>{k}</div>
                  {abMap[k] !== undefined ? (
                    <>
                      <div style={{ fontSize: 20, color: '#e2c98f', fontWeight: 'bold' }}>{abMap[k]}</div>
                      <div style={{ fontSize: 11, color: '#9bc97d' }}>{fmtMod(abMap[k])}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 16, color: '#605a4e', fontStyle: 'italic', marginTop: 4 }}>—</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#605a4e', fontStyle: 'italic' }}>Atributos não definidos.</div>
          )}
        </Section>
      </div>

      {/* Skills + Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <Section title="Perícias">
          {skills.length ? (
            <div>{skills.map((s, i) => <Chip key={i}>{String(s)}</Chip>)}</div>
          ) : (
            <div style={{ color: '#605a4e', fontStyle: 'italic' }}>—</div>
          )}
        </Section>

        <Section title="Traços Raciais & Habilidades">
          {(racialTraits.length || classFeatures.length || feats.length) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {racialTraits.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Raciais</div>
                  {racialTraits.map((t, i) => <Chip key={i} color="#7da3c9">{typeof t === 'object' ? (t.name || JSON.stringify(t)) : String(t)}</Chip>)}
                </div>
              )}
              {classFeatures.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Classe</div>
                  {classFeatures.map((t, i) => <Chip key={i}>{typeof t === 'object' ? (t.name || JSON.stringify(t)) : String(t)}</Chip>)}
                </div>
              )}
              {feats.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Talentos</div>
                  {feats.map((t, i) => <Chip key={i} color="#b27dc9">{typeof t === 'object' ? (t.name || JSON.stringify(t)) : String(t)}</Chip>)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#605a4e', fontStyle: 'italic' }}>—</div>
          )}
        </Section>
      </div>

      {/* Spells (if any) */}
      {hasSpells && (
        <Section title="Magias" accent="#b27dc9">
          {spellcastingAbility && <Row label="Atributo Conjurador" value={spellcastingAbility} />}
          {spellSaveDC && <Row label="CD de Magia" value={spellSaveDC} />}
          {spellAttackBonus && <Row label="Bônus de Ataque Mágico" value={spellAttackBonus} />}
          {spellSlots && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Espaços de Magia</div>
              <div style={{ color: '#d4c4a8', fontSize: 12 }}>
                {typeof spellSlots === 'object' && !Array.isArray(spellSlots)
                  ? Object.entries(spellSlots).map(([k, v]) => `${k}: ${v}`).join(' · ')
                  : String(spellSlots)}
              </div>
            </div>
          )}
          {cantrips.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Truques</div>
              {cantrips.map((c, i) => <Chip key={i} color="#b27dc9">{typeof c === 'object' ? (c.name || JSON.stringify(c)) : String(c)}</Chip>)}
            </div>
          )}
          {spells.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Magias</div>
              {spells.map((c, i) => <Chip key={i} color="#b27dc9">{typeof c === 'object' ? (c.name || JSON.stringify(c)) : String(c)}</Chip>)}
            </div>
          )}
        </Section>
      )}

      {/* Equipment */}
      <Section title="Equipamento">
        {equipment.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18, color: '#d4c4a8' }}>
            {equipment.map((e, i) => (
              <li key={i} style={{ marginBottom: 2, fontSize: 13 }}>
                {typeof e === 'object' ? (e.name || JSON.stringify(e)) : String(e)}
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#605a4e', fontStyle: 'italic' }}>—</div>
        )}
        <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
          {gold !== undefined && gold !== null && <Chip color="#e2c98f">💰 {String(gold)} po</Chip>}
          {magicItem && <Chip color="#b27dc9">✨ {typeof magicItem === 'object' ? (magicItem.name || JSON.stringify(magicItem)) : String(magicItem)}</Chip>}
        </div>
      </Section>

      {/* Narrative */}
      <Section title="História & Identidade Narrativa" accent="#9bc97d">
        <Row label="Traço de Personalidade" value={personalityTrait} />
        <Row label="Ideal" value={ideal} />
        <Row label="Vínculo" value={bond} />
        <Row label="Falha" value={flaw} />
        {backstory && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: '#a29a88', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>História</div>
            <div style={{ color: '#d4c4a8', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{backstory}</div>
          </div>
        )}
      </Section>
    </div>
  );
}
