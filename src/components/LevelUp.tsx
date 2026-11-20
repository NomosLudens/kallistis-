import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/supabase/client';
import { type CharacterSummary } from '@/data/characters';
import { useCharacterData } from '@/hooks/useCharacterData';
import {
  applySheetPatchWithWarnings,
  applySummaryPatchWithWarnings,
  type CharacterOverride,
  type PatchWarning,
} from '@/lib/mergeOverrides';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, ChatBubble, type VmStatusTone } from '@/components/fantasy';

const LEVELUP_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/levelup-ia`;

type LevelUpStatus = 'enabled' | 'in_progress' | 'submitted' | 'approved';
interface LevelUpRequest {
  id: string;
  character_id: string;
  from_level: number;
  to_level: number;
  status: LevelUpStatus;
  enabled_by_email: string | null;
  enabled_at: string;
  submitted_at: string | null;
  approved_at: string | null;
}
interface LevelUpSheet {
  id: string;
  request_id: string;
  summary: string;
  decisions: any;
  created_at: string;
}
type ChatMsg = { role: 'user' | 'assistant'; content: string };

interface AIPatch {
  summary_patch: Record<string, any>;
  sheet_patch: Record<string, any>;
  notes?: string;
}

const STATUS_LABEL: Record<LevelUpStatus, string> = {
  enabled: 'Habilitado',
  in_progress: 'Em progresso',
  submitted: 'Enviado',
  approved: 'Aprovado',
};
const STATUS_COLOR: Record<LevelUpStatus, string> = {
  enabled: '#c3a45e',
  in_progress: '#7da3c9',
  submitted: '#9bc97d',
  approved: '#b27dc9',
};
const STATUS_TONE: Record<LevelUpStatus, VmStatusTone> = {
  enabled: 'warn',
  in_progress: 'progress',
  submitted: 'ok',
  approved: 'feat',
};

function getCurrentLevelFromClassInfo(classInfo: string): number {
  const m = classInfo.match(/Nv\s*(\d+)/i);
  if (m) return parseInt(m[1], 10);
  const m2 = classInfo.match(/N[ií]vel\s*(\d+)/i);
  if (m2) return parseInt(m2[1], 10);
  return 1;
}

const LEVELUP_EXCLUDED_IDS = new Set(['char-elias', 'char-theron', 'char-sael', 'char-egrath']);

export default function LevelUp({ isAdmin }: { isAdmin: boolean }) {
  const { summaries: allSummaries, sheets: characterSheets, overrides, reload: reloadCharacterData } = useCharacterData();
  const summaries = allSummaries.filter(s => !LEVELUP_EXCLUDED_IDS.has(s.id));
  const [requests, setRequests] = useState<LevelUpRequest[]>([]);
  const [sheets, setSheets] = useState<LevelUpSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [enableModal, setEnableModal] = useState<{ char: CharacterSummary } | null>(null);
  const [enableTargetLevel, setEnableTargetLevel] = useState<number>(2);
  const [activeRequest, setActiveRequest] = useState<LevelUpRequest | null>(null);
  const [viewSheet, setViewSheet] = useState<{ sheet: LevelUpSheet; charName: string; request: LevelUpRequest } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LevelUpRequest | null>(null);
  const [confirmDeleteCharName, setConfirmDeleteCharName] = useState<string>('');
  const [confirmApprove, setConfirmApprove] = useState<LevelUpRequest | null>(null);
  const [confirmRevert, setConfirmRevert] = useState<CharacterOverride | null>(null);

  // AI patch flow state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPatch, setAiPatch] = useState<AIPatch | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, shtRes] = await Promise.all([
        supabase.from('level_up_requests').select('*').order('enabled_at', { ascending: false }),
        supabase.from('level_up_sheets').select('*').order('created_at', { ascending: false }),
      ]);
      if (reqRes.error) throw reqRes.error;
      if (shtRes.error) throw shtRes.error;
      setRequests((reqRes.data || []) as LevelUpRequest[]);
      setSheets((shtRes.data || []) as LevelUpSheet[]);
    } catch (e) {
      console.error('Failed to load level-up data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const latestByCharacter = useMemo(() => {
    const map = new Map<string, LevelUpRequest>();
    for (const r of requests) {
      const existing = map.get(r.character_id);
      if (!existing || new Date(r.enabled_at) > new Date(existing.enabled_at)) {
        map.set(r.character_id, r);
      }
    }
    return map;
  }, [requests]);

  const sheetByRequest = useMemo(() => {
    const map = new Map<string, LevelUpSheet>();
    for (const s of sheets) map.set(s.request_id, s);
    return map;
  }, [sheets]);

  const overrideByRequest = useMemo(() => {
    const map = new Map<string, CharacterOverride>();
    for (const ov of overrides) {
      if (ov.request_id) map.set(ov.request_id, ov);
    }
    return map;
  }, [overrides]);

  const openEnableModal = (char: CharacterSummary) => {
    const current = getCurrentLevelFromClassInfo(char.classInfo);
    setEnableTargetLevel(Math.min(current + 1, 20));
    setEnableModal({ char });
  };

  const confirmEnable = async () => {
    if (!enableModal) return;
    const current = getCurrentLevelFromClassInfo(enableModal.char.classInfo);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('level_up_requests').insert({
        character_id: enableModal.char.id,
        from_level: current,
        to_level: enableTargetLevel,
        status: 'enabled',
        enabled_by_email: user?.email ?? null,
      });
      if (error) throw error;
      setEnableModal(null);
      await loadAll();
    } catch (e) {
      console.error('Failed to enable level up:', e);
    }
  };

  const handleDeleteRequest = async () => {
    if (!confirmDelete) return;
    try {
      await supabase.from('level_up_requests').delete().eq('id', confirmDelete.id);
      setConfirmDelete(null);
      await loadAll();
    } catch (e) { console.error('delete failed', e); }
  };

  const handleApprove = async () => {
    if (!confirmApprove) return;
    try {
      await supabase.from('level_up_requests').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      }).eq('id', confirmApprove.id);
      setConfirmApprove(null);
      setViewSheet(null);
      await loadAll();
    } catch (e) { console.error('approve failed', e); }
  };

  const closeViewSheet = () => {
    setViewSheet(null);
    setAiPatch(null);
    setAiError(null);
    setAiLoading(false);
  };

  const generateAIPatch = async () => {
    if (!viewSheet) return;
    setAiLoading(true);
    setAiError(null);
    setAiPatch(null);
    try {
      const charId = viewSheet.request.character_id;
      const currentSummary = summaries.find(s => s.id === charId) ?? null;
      const currentSheet = characterSheets.find(s => s.id === charId) ?? null;
      const { data, error } = await supabase.functions.invoke('aplicar-levelup-ficha', {
        body: { requestId: viewSheet.request.id, currentSummary, currentSheet },
      });
      if (error) throw error;
      if (!data || data.error) throw new Error(data?.error || 'Resposta inválida da IA');
      setAiPatch({
        summary_patch: data.summary_patch || {},
        sheet_patch: data.sheet_patch || {},
        notes: data.notes,
      });
    } catch (e: any) {
      console.error('AI patch failed', e);
      setAiError(e.message || 'Falha ao gerar atualização via IA');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIPatch = async () => {
    if (!viewSheet || !aiPatch) return;
    setApplying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insErr } = await supabase.from('character_overrides').insert({
        character_id: viewSheet.request.character_id,
        request_id: viewSheet.request.id,
        summary_patch: aiPatch.summary_patch,
        sheet_patch: aiPatch.sheet_patch,
        applied_by_email: user?.email ?? null,
      });
      if (insErr) throw insErr;
      const { error: updErr } = await supabase.from('level_up_requests').update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      }).eq('id', viewSheet.request.id);
      if (updErr) throw updErr;
      await Promise.all([loadAll(), reloadCharacterData()]);
      closeViewSheet();
    } catch (e: any) {
      console.error('apply patch failed', e);
      setAiError(e.message || 'Falha ao aplicar atualização');
    } finally {
      setApplying(false);
    }
  };

  const revertOverride = async () => {
    if (!confirmRevert) return;
    try {
      await supabase.from('character_overrides').delete().eq('id', confirmRevert.id);
      if (confirmRevert.request_id) {
        await supabase.from('level_up_requests').update({
          status: 'submitted',
          approved_at: null,
        }).eq('id', confirmRevert.request_id);
      }
      setConfirmRevert(null);
      closeViewSheet();
      await Promise.all([loadAll(), reloadCharacterData()]);
    } catch (e) { console.error('revert failed', e); }
  };

  // -------- Chat mode --------
  if (activeRequest) {
    const char = summaries.find(c => c.id === activeRequest.character_id);
    return (
      <LevelUpChat
        request={activeRequest}
        character={char || null}
        onExit={async () => { setActiveRequest(null); await loadAll(); }}
      />
    );
  }

  // -------- List mode --------
  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--vm-font-heading)', fontSize: 32, color: '#c3a45e', margin: 0 }}>⬆ Level Up</h1>
        <p style={{ color: '#8c8478', marginTop: 6, fontSize: 14 }}>
          {isAdmin
            ? 'Habilite personagens para subir de nível. Revise as fichas enviadas e aplique as mudanças com auxílio da IA (Grok).'
            : 'Personagens disponíveis para evolução. Clique em um para iniciar o processo guiado por IA.'}
        </p>
        {/* Regra da casa de Velmoor */}
        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(139,26,26,0.1)', border: '1px solid rgba(201,148,58,0.35)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>❤️‍🔥</span>
          <div style={{ fontSize: 13, color: '#d4b880', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--vm-gold-light)', fontFamily: 'var(--vm-font-heading)' }}>Regra da casa — Pontos de Vida:</strong>{' '}
            ao subir de nível, o PV ganho é sempre o <strong>valor máximo do dado de vida</strong> + modificador de CON — sem rolagem nem média.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#8c8478', textAlign: 'center', padding: 40 }}>Carregando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {summaries.map(char => {
            const req = latestByCharacter.get(char.id);
            const sheet = req ? sheetByRequest.get(req.id) : undefined;
            const currentLevel = getCurrentLevelFromClassInfo(char.classInfo);
            const status = req?.status;

            if (!isAdmin && !req) return null;

            const isLocked = !isAdmin && (status === 'submitted' || status === 'approved');
            const canStart = !isAdmin && (status === 'enabled' || status === 'in_progress');

            return (
              <div key={char.id} style={{
                border: '1px solid rgba(201,148,58,0.3)',
                borderRadius: 8,
                background: 'rgba(15,12,9,0.6)',
                padding: 16,
                position: 'relative',
              }}>
                {isAdmin && req && (
                  <button
                    onClick={() => { setConfirmDeleteCharName(char.name); setConfirmDelete(req); }}
                    title="Remover este pedido de Level Up"
                    aria-label="Remover pedido"
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 24, height: 24, padding: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: '1px solid transparent',
                      color: '#c97d7d', borderRadius: 4, cursor: 'pointer',
                      fontSize: 14, lineHeight: 1, transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(201,125,125,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(201,125,125,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >✕</button>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingRight: isAdmin && req ? 28 : 0 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--vm-font-heading)', color: '#c3a45e', margin: 0, fontSize: 18 }}>{char.name}</h3>
                    <div style={{ color: '#8c8478', fontSize: 12, marginTop: 2 }}>{char.classInfo}</div>
                    <div style={{ color: '#605a4e', fontSize: 11, marginTop: 2 }}>Jogador: {char.player}</div>
                  </div>
                  {status && (
                    <StatusBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</StatusBadge>
                  )}
                </div>

                {req && (
                  <div style={{ marginTop: 12, fontSize: 13, color: '#a29a88' }}>
                    Nível <strong style={{ color: '#c3a45e' }}>{req.from_level}</strong> → <strong style={{ color: '#c3a45e' }}>{req.to_level}</strong>
                  </div>
                )}

                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    const hasPending = !!status && (status === 'enabled' || status === 'in_progress' || status === 'submitted');
                    const canEnableNew = isAdmin && (!req || status === 'approved');
                    if (canEnableNew) {
                      return (
                        <Button size="sm" onClick={() => openEnableModal(char)}
                          style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
                          {req ? 'Habilitar Novo Level Up' : 'Habilitar Level Up'}
                        </Button>
                      );
                    }
                    if (isAdmin && hasPending) {
                      return (
                        <Button size="sm" disabled
                          title="Já existe um Level Up em andamento para este personagem. Cancele ou aprove o pedido atual antes de habilitar outro."
                          style={{ background: 'rgba(201,148,58,0.15)', color: '#8c8478', border: '1px solid rgba(201,148,58,0.3)', cursor: 'not-allowed' }}>
                          ⏳ Level Up em andamento
                        </Button>
                      );
                    }
                    return null;
                  })()}
                  {isAdmin && req && status === 'submitted' && sheet && (
                    <Button size="sm" variant="outline"
                      onClick={() => setViewSheet({ sheet, charName: char.name, request: req })}>
                      Ver Ficha Enviada
                    </Button>
                  )}
                  {isAdmin && req && (status === 'enabled' || status === 'in_progress') && (
                    <Button size="sm" variant="outline" onClick={() => { setConfirmDeleteCharName(char.name); setConfirmDelete(req); }}
                      style={{ borderColor: '#c97d7d', color: '#c97d7d' }}>
                      Cancelar
                    </Button>
                  )}
                  {isAdmin && req && status === 'approved' && sheet && (
                    <Button size="sm" variant="outline"
                      onClick={() => setViewSheet({ sheet, charName: char.name, request: req })}>
                      Revisar Ficha
                    </Button>
                  )}

                  {canStart && req && (
                    <Button size="sm" onClick={() => setActiveRequest(req)}
                      style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
                      {status === 'in_progress' ? 'Continuar Level Up' : 'Iniciar Level Up'}
                    </Button>
                  )}
                  {isLocked && (
                    <div style={{ color: '#8c8478', fontSize: 12, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                      🔒 Aguardando revisão do mestre
                    </div>
                  )}
                </div>

                {!isAdmin && currentLevel > 0 && (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#605a4e' }}>
                    Nível atual: {currentLevel}
                  </div>
                )}
              </div>
            );
          })}

          {!isAdmin && requests.length === 0 && (
            <div style={{ gridColumn: '1 / -1', color: '#8c8478', textAlign: 'center', padding: 40, fontStyle: 'italic' }}>
              Nenhum personagem habilitado para evolução no momento. Aguarde o mestre.
            </div>
          )}
        </div>
      )}

      {/* Modal: Habilitar */}
      <Dialog open={!!enableModal} onOpenChange={(o) => !o && setEnableModal(null)}>
        <DialogContent style={{ background: '#17161f', border: '1px solid rgba(201,148,58,0.4)', color: '#c3a45e' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>
              Habilitar Level Up
            </DialogTitle>
            <DialogDescription style={{ color: '#8c8478' }}>
              {enableModal?.char.name} — atualmente nível {enableModal && getCurrentLevelFromClassInfo(enableModal.char.classInfo)}
            </DialogDescription>
          </DialogHeader>
          <div style={{ padding: '12px 0' }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a29a88', fontSize: 13 }}>
              Nível alvo:
            </label>
            <Select value={String(enableTargetLevel)} onValueChange={(v) => setEnableTargetLevel(parseInt(v, 10))}>
              <SelectTrigger style={{ background: '#0d0d12', borderColor: 'rgba(201,148,58,0.4)', color: '#c3a45e' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#17161f', borderColor: 'rgba(201,148,58,0.4)' }}>
                {Array.from({ length: 20 }, (_, i) => i + 1)
                  .filter(lv => enableModal && lv > getCurrentLevelFromClassInfo(enableModal.char.classInfo))
                  .map(lv => (
                    <SelectItem key={lv} value={String(lv)} style={{ color: '#c3a45e' }}>Nível {lv}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnableModal(null)}>Cancelar</Button>
            <Button onClick={confirmEnable}
              style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
              Habilitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Ficha + IA */}
      <Dialog open={!!viewSheet} onOpenChange={(o) => !o && closeViewSheet()}>
        <DialogContent style={{
          background: '#17161f', border: '1px solid rgba(201,148,58,0.4)',
          color: '#c3a45e', maxWidth: '95vw', width: 900, maxHeight: '90vh', overflow: 'auto',
        }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>
              Ficha de Level Up — {viewSheet?.charName}
            </DialogTitle>
          </DialogHeader>

          {viewSheet && (() => {
            const existingOverride = overrideByRequest.get(viewSheet.request.id) || null;
            const status = viewSheet.request.status;
            return (
              <>
                <div style={{ padding: '8px 0', color: '#d4c4a8', lineHeight: 1.6 }} className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{viewSheet.sheet.summary}</ReactMarkdown>
                </div>

                {/* Approved with override */}
                {status === 'approved' && existingOverride && (
                  <div style={{
                    marginTop: 14, padding: 12, borderRadius: 6,
                    background: 'rgba(155,201,125,0.08)', border: '1px solid rgba(155,201,125,0.3)',
                  }}>
                    <div style={{ color: '#9bc97d', fontSize: 13, marginBottom: 6 }}>
                      ✓ Ficha já atualizada em {new Date(existingOverride.applied_at).toLocaleString('pt-BR')}
                      {isAdmin && existingOverride.applied_by_email && ` por ${existingOverride.applied_by_email}`}
                    </div>
                    <Button size="sm" variant="outline"
                      onClick={() => setConfirmRevert(existingOverride)}
                      style={{ borderColor: '#c97d7d', color: '#c97d7d' }}>
                      ↩ Reverter atualização
                    </Button>
                  </div>
                )}

                {/* AI controls (submitted, no override yet, or approved-without-override) */}
                {(status === 'submitted' || (status === 'approved' && !existingOverride)) && !aiPatch && (
                  <div style={{ marginTop: 14, padding: 12, borderRadius: 6, background: 'rgba(201,148,58,0.06)', border: '1px solid rgba(201,148,58,0.25)' }}>
                    <div style={{ color: '#a29a88', fontSize: 13, marginBottom: 10 }}>
                      Use o Grok para gerar automaticamente as mudanças necessárias na ficha do personagem (resumo do grupo + ficha completa).
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button size="sm" onClick={generateAIPatch} disabled={aiLoading}
                        style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
                        {aiLoading ? '⏳ Grok está analisando a ficha...' : '🪄 Gerar atualização da ficha (IA)'}
                      </Button>
                      {status === 'submitted' && (
                        <Button size="sm" variant="outline" onClick={() => setConfirmApprove(viewSheet.request)}
                          style={{ borderColor: '#9bc97d', color: '#9bc97d' }}>
                          Aprovar manualmente (sem aplicar à ficha)
                        </Button>
                      )}
                    </div>
                    {aiError && (
                      <div style={{ marginTop: 10, padding: 10, borderRadius: 4, background: 'rgba(201,125,125,0.1)', border: '1px solid rgba(201,125,125,0.4)', color: '#e8a8a8', fontSize: 12 }}>
                        ⚠️ {aiError}
                      </div>
                    )}
                  </div>
                )}

                {/* AI patch preview */}
                {aiPatch && (
                  <div style={{ marginTop: 14, borderRadius: 6, background: 'rgba(15,12,9,0.6)', border: '1px solid rgba(201,148,58,0.4)' }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(201,148,58,0.25)', color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 14 }}>
                      🪄 Mudanças propostas pela IA
                    </div>
                    <div style={{ padding: 14 }}>
                      <PatchDiffView summary_patch={aiPatch.summary_patch} sheet_patch={aiPatch.sheet_patch} />
                      {(() => {
                        const charId = viewSheet.request.character_id;
                        const baseSummary = summaries.find(s => s.id === charId);
                        const baseSheet = characterSheets.find(s => s.id === charId);
                        const warnings: PatchWarning[] = [];
                        if (baseSummary) warnings.push(...applySummaryPatchWithWarnings(baseSummary, aiPatch.summary_patch).warnings);
                        if (baseSheet) warnings.push(...applySheetPatchWithWarnings(baseSheet, aiPatch.sheet_patch).warnings);
                        if (warnings.length === 0) return null;
                        return (
                          <div style={{ marginTop: 12, padding: 10, borderRadius: 4, background: 'rgba(201,148,58,0.08)', border: '1px solid rgba(201,148,58,0.4)' }}>
                            <div style={{ color: '#c3a45e', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                              ⚠ Avisos da aplicação ({warnings.length})
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, color: '#e8d4a8', fontSize: 12, lineHeight: 1.55 }}>
                              {warnings.map((w, i) => (
                                <li key={i}>
                                  <code style={{ color: '#c3a45e' }}>{w.path}</code> · <strong>{w.op}</strong>(<em>{w.match}</em>) — {w.reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {aiPatch.notes && (
                        <div style={{ marginTop: 12, padding: 10, borderRadius: 4, background: 'rgba(125,163,201,0.08)', border: '1px solid rgba(125,163,201,0.3)' }}>
                          <div style={{ color: '#7da3c9', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Notas da IA</div>
                          <div style={{ color: '#c4d4e8', fontSize: 13, lineHeight: 1.5 }}>{aiPatch.notes}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(201,148,58,0.25)', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => { setAiPatch(null); setAiError(null); }}>
                        Cancelar
                      </Button>
                      <Button size="sm" variant="outline" onClick={generateAIPatch} disabled={aiLoading}>
                        🔄 Gerar novamente
                      </Button>
                      <Button size="sm" onClick={applyAIPatch} disabled={applying}
                        style={{ background: '#9bc97d', color: '#0d0d12', border: 'none' }}>
                        {applying ? 'Aplicando...' : '✓ Aplicar à ficha do personagem'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover este pedido de Level Up?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDeleteCharName && (
                <div style={{ marginBottom: 8, color: '#c3a45e' }}>
                  <strong>{confirmDeleteCharName}</strong> — Nv {confirmDelete?.from_level} → {confirmDelete?.to_level}
                </div>
              )}
              {confirmDelete?.status === 'enabled' && 'O pedido será removido junto com o progresso do chat. O jogador precisará iniciar novamente.'}
              {confirmDelete?.status === 'in_progress' && 'O pedido será removido junto com o progresso do chat. O jogador precisará iniciar novamente.'}
              {confirmDelete?.status === 'submitted' && 'A ficha enviada pelo jogador será descartada. Ele poderá refazer ou você poderá habilitar com outro nível alvo.'}
              {confirmDelete?.status === 'approved' && (
                <>O pedido aprovado será removido do histórico. <strong>Se já existe um override aplicado à ficha, reverta-o antes</strong> para não deixar mudanças órfãs.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest} style={{ background: '#c97d7d' }}>
              Remover Pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm approve (manual / legacy) */}
      <AlertDialog open={!!confirmApprove} onOpenChange={(o) => !o && setConfirmApprove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar manualmente?</AlertDialogTitle>
            <AlertDialogDescription>
              A ficha será marcada como <strong>aprovada</strong> sem gravar atualização automática. Use este caminho apenas se for aplicar as mudanças manualmente no código. Para refletir as mudanças automaticamente nas fichas, prefira "🪄 Gerar atualização da ficha (IA)".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} style={{ background: '#9bc97d', color: '#0d0d12' }}>
              Aprovar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm revert */}
      <AlertDialog open={!!confirmRevert} onOpenChange={(o) => !o && setConfirmRevert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverter atualização da ficha?</AlertDialogTitle>
            <AlertDialogDescription>
              A atualização aplicada à ficha do personagem será removida e a solicitação voltará para o estado "Enviado", podendo ser regerada via IA. As mudanças no resumo do grupo e na ficha individual serão revertidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={revertOverride} style={{ background: '#c97d7d' }}>
              Reverter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// =================== Patch diff view ===================
function OpChip({ kind, children }: { kind: 'add' | 'replace' | 'remove' | 'set'; children: React.ReactNode }) {
  const colors: Record<string, { bg: string; border: string; fg: string }> = {
    add: { bg: 'rgba(155,201,125,0.12)', border: 'rgba(155,201,125,0.5)', fg: '#9bc97d' },
    replace: { bg: 'rgba(201,180,125,0.12)', border: 'rgba(201,180,125,0.5)', fg: '#c9b47d' },
    remove: { bg: 'rgba(201,125,125,0.12)', border: 'rgba(201,125,125,0.5)', fg: '#c97d7d' },
    set: { bg: 'rgba(125,163,201,0.12)', border: 'rgba(125,163,201,0.5)', fg: '#7da3c9' },
  };
  const c = colors[kind];
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px', borderRadius: 3,
      background: c.bg, border: `1px solid ${c.border}`, color: c.fg,
      fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6,
      fontFamily: 'var(--vm-font-heading)',
    }}>{children}</span>
  );
}

function describeItem(it: any): string {
  if (it == null) return '';
  if (typeof it === 'string') return it;
  if (typeof it === 'object') {
    const name = it.name ?? it.label ?? it.match ?? it.title ?? '';
    const extras = Object.entries(it)
      .filter(([k]) => !['name', 'label', 'match', 'title'].includes(k))
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join(' · ');
    return name ? (extras ? `${name} — ${extras}` : name) : JSON.stringify(it);
  }
  return String(it);
}

function ArrayOps({ patch, prefix }: { patch: Record<string, any>; prefix: string }) {
  const ops: { kind: 'add' | 'replace' | 'remove'; key: string; items: any[] }[] = [];
  for (const k of Object.keys(patch)) {
    if (k.startsWith(`${prefix}.`)) {
      const op = k.slice(prefix.length + 1) as 'add' | 'replace' | 'remove';
      if (['add', 'replace', 'remove'].includes(op) && Array.isArray(patch[k])) {
        ops.push({ kind: op, key: prefix, items: patch[k] });
      }
    }
  }
  if (ops.length === 0) return null;
  return (
    <>
      {ops.map((o, i) => (
        <div key={`${o.key}-${o.kind}-${i}`} style={{ marginTop: 6, fontSize: 13, color: '#d4c4a8' }}>
          <OpChip kind={o.kind}>{o.kind} {o.key}</OpChip>
          <ul style={{ margin: '4px 0 0 22px', padding: 0, color: '#a29a88', fontSize: 12, listStyle: 'disc' }}>
            {o.items.map((it, j) => <li key={j} style={{ marginTop: 2 }}>{describeItem(it)}</li>)}
          </ul>
        </div>
      ))}
    </>
  );
}

function SetOps({ set }: { set: Record<string, any> | undefined }) {
  if (!set || typeof set !== 'object' || Object.keys(set).length === 0) return null;
  return (
    <div style={{ marginTop: 6, fontSize: 13, color: '#d4c4a8' }}>
      <OpChip kind="set">set</OpChip>
      <ul style={{ margin: '4px 0 0 22px', padding: 0, color: '#a29a88', fontSize: 12, listStyle: 'disc' }}>
        {Object.entries(set).map(([k, v]) => (
          <li key={k} style={{ marginTop: 2 }}>
            <span style={{ color: '#c3a45e' }}>{k}</span>: {typeof v === 'string' ? v : JSON.stringify(v)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PatchSection({ title, patch, fields }: { title: string; patch: Record<string, any>; fields: string[] }) {
  const hasSet = patch.set && Object.keys(patch.set).length > 0;
  const hasArrayOps = fields.some(f => Object.keys(patch).some(k => k.startsWith(`${f}.`)));
  if (!hasSet && !hasArrayOps) {
    return (
      <div style={{ color: '#605a4e', fontSize: 12, fontStyle: 'italic' }}>Sem alterações.</div>
    );
  }
  return (
    <div>
      <SetOps set={patch.set} />
      {fields.map(f => <ArrayOps key={f} patch={patch} prefix={f} />)}
    </div>
  );
}

function PatchDiffView({ summary_patch, sheet_patch }: { summary_patch: Record<string, any>; sheet_patch: Record<string, any> }) {
  const summaryFields = ['combatStats', 'attributes', 'tags'];
  const panelFields = ['table', 'traits', 'attributes', 'spellTags'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <section>
        <div style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Resumo do personagem
        </div>
        <PatchSection title="Resumo" patch={summary_patch || {}} fields={summaryFields} />
      </section>

      {/* Sheet root */}
      <section>
        <div style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Ficha completa
        </div>
        <SetOps set={sheet_patch?.set} />

        {/* Panels */}
        {Array.isArray(sheet_patch?.panels) && sheet_patch.panels.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sheet_patch.panels.map((pp: any, i: number) => (
              <div key={i} style={{ padding: 10, borderRadius: 4, background: 'rgba(201,148,58,0.05)', border: '1px solid rgba(201,148,58,0.2)' }}>
                <div style={{ color: '#e2c98f', fontSize: 12, fontFamily: 'var(--vm-font-heading)', marginBottom: 4 }}>
                  Painel ({pp.side || 'left'}): <strong>{pp.title || pp.newTitle || '—'}</strong>
                  {pp.newTitle && pp.newTitle !== pp.title && <> → renomear para <em>{pp.newTitle}</em></>}
                </div>
                <PatchSection title="Painel" patch={pp} fields={panelFields} />
              </div>
            ))}
          </div>
        )}

        {/* abilities.* */}
        {(sheet_patch?.['abilities.title'] ||
          sheet_patch?.['abilities.resourceSummary'] ||
          sheet_patch?.['abilities.items.add'] ||
          sheet_patch?.['abilities.items.remove'] ||
          sheet_patch?.['abilities.items.replace']) && (
          <div style={{ marginTop: 10, padding: 10, borderRadius: 4, background: 'rgba(178,125,201,0.06)', border: '1px solid rgba(178,125,201,0.3)' }}>
            <div style={{ color: '#b27dc9', fontSize: 12, fontFamily: 'var(--vm-font-heading)', marginBottom: 4 }}>
              Habilidades em destaque
            </div>
            {sheet_patch['abilities.title'] && (
              <div style={{ fontSize: 12, color: '#d4c4a8', marginTop: 4 }}>
                <OpChip kind="set">title</OpChip>{sheet_patch['abilities.title']}
              </div>
            )}
            {sheet_patch['abilities.resourceSummary'] && (
              <div style={{ fontSize: 12, color: '#d4c4a8', marginTop: 4 }}>
                <OpChip kind="set">resourceSummary</OpChip>{sheet_patch['abilities.resourceSummary']}
              </div>
            )}
            <ArrayOps patch={{
              'items.add': sheet_patch['abilities.items.add'],
              'items.remove': sheet_patch['abilities.items.remove'],
              'items.replace': sheet_patch['abilities.items.replace'],
            }} prefix="items" />
          </div>
        )}

        {!sheet_patch?.set && !Array.isArray(sheet_patch?.panels) &&
          !sheet_patch?.['abilities.items.add'] && !sheet_patch?.['abilities.title'] && !sheet_patch?.['abilities.resourceSummary'] && (
            <div style={{ color: '#605a4e', fontSize: 12, fontStyle: 'italic' }}>Sem alterações na ficha completa.</div>
        )}
      </section>
    </div>
  );
}

// =================== CHAT ===================
function LevelUpChat({
  request, character, onExit,
}: {
  request: LevelUpRequest;
  character: CharacterSummary | null;
  onExit: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('level_up_chat_messages')
          .select('*')
          .eq('request_id', request.id)
          .order('created_at', { ascending: true });
        if (error) throw error;
        const loaded = (data || []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
        setMessages(loaded);

        const { data: sheetData } = await supabase
          .from('level_up_sheets')
          .select('*')
          .eq('request_id', request.id)
          .maybeSingle();
        if (sheetData) setSubmitted(true);
      } catch (e) {
        console.error('Failed to load level-up history', e);
      } finally {
        setBootstrapped(true);
      }
    })();
  }, [request.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (messages.length === 0 && !isLoading && !submitted) {
      sendMessage('Olá! Estou pronto para começar. Lembrete da regra de casa de Velmoor: PV por nível = valor máximo do dado de vida + CON, sem rolagem nem média.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading || submitted) return;
    if (!overrideText) setInput('');

    const userMsg: ChatMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      await supabase.from('level_up_chat_messages').insert({
        request_id: request.id, role: 'user', content: text,
      });
      if (request.status === 'enabled') {
        await supabase.from('level_up_requests').update({ status: 'in_progress' }).eq('id', request.id);
      }
    } catch (e) { console.error('persist user msg', e); }

    let assistant = '';
    try {
      const resp = await fetch(LEVELUP_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updated,
          character,
          fromLevel: request.from_level,
          toLevel: request.to_level,
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
        await supabase.from('level_up_chat_messages').insert({
          request_id: request.id, role: 'assistant', content: assistant,
        });

        if (assistant.includes('[GERAR_FICHA]')) {
          const cleanSummary = assistant.replace(/\[GERAR_FICHA\]/g, '').trim();
          try {
            await supabase.from('level_up_sheets').insert({
              request_id: request.id,
              summary: cleanSummary,
              decisions: {},
            });
            await supabase.from('level_up_requests').update({
              status: 'submitted',
              submitted_at: new Date().toISOString(),
            }).eq('id', request.id);
            setSubmitted(true);
          } catch (e) { console.error('save sheet', e); }
        }
      }
    } catch (e: any) {
      const errMsg = `⚠️ ${e.message || 'Erro ao conectar com a IA'}`;
      setMessages([...updated, { role: 'assistant', content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, submitted, messages, request, character]);

  const lastAssistant = messages[messages.length - 1];
  const suggestions = useMemo(() => {
    if (!lastAssistant || lastAssistant.role !== 'assistant' || isLoading) return [];
    const matches = Array.from(lastAssistant.content.matchAll(/\[OPÇÃO:\s*([^\]]+?)\]/g));
    return matches.map(m => m[1].trim());
  }, [lastAssistant, isLoading]);

  const renderContent = (content: string) => {
    const cleaned = content.replace(/\[OPÇÃO:[^\]]+\]/g, '').replace(/\[GERAR_FICHA\]/g, '').trim();
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleaned}</ReactMarkdown>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: '#08080c' }}>
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid rgba(201,148,58,0.3)',
        background: '#0d0d12', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)', fontSize: 16, fontWeight: 600 }}>
            ⬆ Level Up — {character?.name || 'Personagem'}
          </div>
          <div style={{ color: '#8c8478', fontSize: 12, marginTop: 2 }}>
            Nível {request.from_level} → {request.to_level}
            {submitted && ' · ✓ Ficha enviada ao mestre'}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}
          style={{ borderColor: 'rgba(201,148,58,0.4)', color: '#c3a45e' }}>
          ← Voltar
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role}>
              {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
            </ChatBubble>
          ))}
          {isLoading && (
            <div style={{ color: '#8c8478', fontStyle: 'italic', fontSize: 13, padding: 8 }}>
              ⏳ A IA está pensando...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

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

      {submitted ? (
        <div style={{
          padding: 20, textAlign: 'center', borderTop: '1px solid rgba(201,148,58,0.3)',
          background: '#0d0d12',
        }}>
          <div style={{ color: '#9bc97d', fontFamily: 'var(--vm-font-heading)', fontSize: 16, marginBottom: 6 }}>
            ✓ Ficha enviada ao mestre
          </div>
          <div style={{ color: '#8c8478', fontSize: 13, marginBottom: 12 }}>
            O mestre receberá sua ficha e aplicará as mudanças. Aguarde a aprovação.
          </div>
          <Button onClick={onExit} style={{ background: '#c3a45e', color: '#0d0d12', border: 'none' }}>
            Voltar ao Painel
          </Button>
        </div>
      ) : (
        <div style={{ padding: 12, borderTop: '1px solid rgba(201,148,58,0.3)', background: '#0d0d12' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 8 }}>
            <textarea
              ref={inputRef}
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
