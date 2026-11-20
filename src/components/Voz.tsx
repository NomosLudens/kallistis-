import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, type Session } from '@google/genai';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ModelId = 'gemini-3.1-flash-live-preview' | 'gemini-3.1-flash-tts-preview';

interface VozConfig {
  enabled: boolean;
  model: ModelId;
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function pcmRateFromMime(mime: string, fallback = 24000): number {
  const m = /rate=(\d+)/.exec(mime || '');
  return m ? parseInt(m[1], 10) : fallback;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  return encodeBase64(new Uint8Array(buf));
}

export default function Voz({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [config, setConfig] = useState<VozConfig>({ enabled: false, model: 'gemini-3.1-flash-live-preview' });
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Live mode refs
  const sessionRef = useRef<Session | null>(null);
  const captureCtxRef = useRef<AudioContext | null>(null);
  const captureNodeRef = useRef<ScriptProcessorNode | null>(null);
  const captureSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playheadRef = useRef<number>(0);

  // Turn mode refs
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const turnStreamRef = useRef<MediaStream | null>(null);
  const historyRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const isTurnMode = config.model === 'gemini-3.1-flash-tts-preview';

  const loadConfig = useCallback(async () => {
    const { data } = await supabase.from('voz_config').select('enabled, model').eq('id', 1).maybeSingle();
    if (data) setConfig({ enabled: !!data.enabled, model: (data.model as ModelId) || 'gemini-3.1-flash-live-preview' });
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  useEffect(() => {
    const ch = supabase
      .channel('voz_config_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'voz_config' }, () => loadConfig())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadConfig]);

  const saveConfig = async (next: Partial<VozConfig>) => {
    setSaving(true);
    const merged = { ...config, ...next };
    const { error } = await supabase
      .from('voz_config')
      .update({ enabled: merged.enabled, model: merged.model, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setSaving(false);
    if (error) { toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' }); return; }
    setConfig(merged);
    toast({ title: '✓ Configuração salva' });
  };

  // ================= LIVE MODE =================
  const stopLive = useCallback(async () => {
    try { sessionRef.current?.close(); } catch {}
    sessionRef.current = null;
    try { captureNodeRef.current?.disconnect(); } catch {}
    try { captureSourceRef.current?.disconnect(); } catch {}
    try { await captureCtxRef.current?.close(); } catch {}
    captureNodeRef.current = null;
    captureSourceRef.current = null;
    captureCtxRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    try { await playbackCtxRef.current?.close(); } catch {}
    playbackCtxRef.current = null;
    playheadRef.current = 0;
    setActive(false);
    setStatus('');
  }, []);

  const scheduleAudioChunk = (pcmBytes: Uint8Array, sampleRate = 24000) => {
    if (!playbackCtxRef.current) {
      playbackCtxRef.current = new AudioContext({ sampleRate });
      playbackCtxRef.current.resume().catch(() => {});
    }
    const ctx = playbackCtxRef.current;
    const usable = pcmBytes.length - (pcmBytes.length % 2);
    const samples = usable / 2;
    if (!samples) return;
    const buffer = ctx.createBuffer(1, samples, sampleRate);
    const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, usable);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      const s = view.getInt16(i * 2, true);
      ch[i] = s / 32768;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    const now = ctx.currentTime;
    const startAt = Math.max(now, playheadRef.current || now);
    src.start(startAt);
    playheadRef.current = startAt + buffer.duration;
  };

  const preflightMic = async () => {
    if (!window.isSecureContext) throw new Error('O navegador exige HTTPS para acessar o microfone.');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não expõe o microfone. Abra a URL publicada em uma aba própria.');
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true,
      } });
    } catch (micErr: any) {
      const name = micErr?.name || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        const inIframe = window.self !== window.top;
        throw new Error(inIframe
          ? 'O microfone está bloqueado dentro do preview do editor. Abra a URL publicada numa aba própria e permita o microfone.'
          : 'Microfone bloqueado. Clique no cadeado da barra de endereço, permita o microfone e recarregue.'
        );
      }
      if (name === 'NotFoundError' || name === 'OverconstrainedError') throw new Error('Nenhum microfone detectado.');
      if (name === 'NotReadableError') throw new Error('O microfone está sendo usado por outro app.');
      throw micErr;
    }
  };

  const startLive = async () => {
    if (connecting || active) return;
    setConnecting(true);
    setTranscript('');
    setStatus('Solicitando acesso ao microfone…');
    try {
      const stream = await preflightMic();
      streamRef.current = stream;

      setStatus('Autorizando com o servidor…');
      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke('voz-token', {
        body: { model: config.model },
      });
      if (tokenErr) throw new Error(tokenErr.message || 'Erro obtendo token');
      if (tokenData?.error) throw new Error(tokenData.error);
      const token: string = tokenData.token;
      const model: string = tokenData.model || config.model;
      if (!token) throw new Error('Token vazio');

      setStatus('Conectando à Lembrança de Casven…');
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });

      const session = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
            languageCode: 'pt-BR',
          },
        },
        callbacks: {
          onopen: () => { setStatus('🕯 Casven ouve.'); setActive(true); setConnecting(false); },
          onmessage: (msg: any) => {
            const parts = msg?.serverContent?.modelTurn?.parts || [];
            for (const p of parts) {
              const data: string | undefined = p?.inlineData?.data;
              const mime: string | undefined = p?.inlineData?.mimeType;
              if (data && mime?.includes('audio')) {
                scheduleAudioChunk(decodeBase64(data), pcmRateFromMime(mime, 24000));
              }
              if (p?.text) setTranscript(prev => prev + p.text);
            }
            const outTx = msg?.serverContent?.outputTranscription?.text;
            if (outTx) setTranscript(prev => prev + outTx);
            if (msg?.serverContent?.turnComplete) setTranscript(prev => prev + '\n');
          },
          onerror: (e: any) => {
            console.error('Live error:', e);
            toast({ title: 'Erro na conexão', description: String(e?.message || e), variant: 'destructive' });
            stopLive();
          },
          onclose: () => { setActive(false); setConnecting(false); setStatus('Conexão encerrada.'); },
        },
      });
      sessionRef.current = session;

      const captureCtx = new AudioContext({ sampleRate: 16000 });
      captureCtxRef.current = captureCtx;
      if (captureCtx.state === 'suspended') await captureCtx.resume().catch(() => {});
      const source = captureCtx.createMediaStreamSource(stream);
      captureSourceRef.current = source;
      const processor = captureCtx.createScriptProcessor(4096, 1, 1);
      captureNodeRef.current = processor;
      processor.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        const input = e.inputBuffer.getChannelData(0);
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        const bytes = new Uint8Array(pcm.buffer);
        try {
          sessionRef.current.sendRealtimeInput({
            audio: { data: encodeBase64(bytes), mimeType: 'audio/pcm;rate=16000' },
          });
        } catch (err) {
          console.warn('send failed', err);
        }
      };
      source.connect(processor);
      processor.connect(captureCtx.destination);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Não foi possível iniciar', description: e?.message || 'Erro', variant: 'destructive' });
      await stopLive();
      setConnecting(false);
    }
  };

  // ================= TURN MODE =================
  const stopTurn = useCallback(() => {
    try { recorderRef.current?.stop(); } catch {}
    recorderRef.current = null;
    turnStreamRef.current?.getTracks().forEach(t => t.stop());
    turnStreamRef.current = null;
    try { playbackCtxRef.current?.close(); } catch {}
    playbackCtxRef.current = null;
    playheadRef.current = 0;
    setRecording(false);
    setProcessing(false);
    setActive(false);
    setStatus('');
  }, []);

  const enterTurnMode = async () => {
    if (active || connecting) return;
    setConnecting(true);
    setTranscript('');
    setStatus('Solicitando acesso ao microfone…');
    try {
      const stream = await preflightMic();
      // We don't keep the stream open between turns to save battery; grab per-turn instead.
      stream.getTracks().forEach(t => t.stop());
      historyRef.current = [];
      setActive(true);
      setStatus('Segure o botão para falar.');
    } catch (e: any) {
      toast({ title: 'Não foi possível iniciar', description: e?.message || 'Erro', variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const startTurnRecording = async () => {
    if (recording || processing) return;
    try {
      const stream = await preflightMic();
      turnStreamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.start();
      setRecording(true);
      setStatus('🎙 Gravando… solte para enviar.');
    } catch (e: any) {
      toast({ title: 'Erro ao gravar', description: e?.message || 'Erro', variant: 'destructive' });
    }
  };

  const stopTurnRecording = async () => {
    const rec = recorderRef.current;
    if (!rec || rec.state === 'inactive') return;
    setRecording(false);
    setProcessing(true);
    setStatus('Enviando ao velho…');

    const stopped = new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        const type = rec.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        resolve(blob);
      };
    });
    try { rec.stop(); } catch {}
    turnStreamRef.current?.getTracks().forEach(t => t.stop());
    turnStreamRef.current = null;

    const blob = await stopped;
    if (blob.size < 1500) {
      setProcessing(false);
      setStatus('Gravação muito curta. Segure e fale.');
      return;
    }

    try {
      const base64 = await blobToBase64(blob);
      const mimeType = blob.type || 'audio/webm';
      setStatus('Casven pondera…');
      const { data, error } = await supabase.functions.invoke('voz-turn', {
        body: { audio: base64, mimeType, history: historyRef.current },
      });
      if (error) throw new Error(error.message || 'Erro no servidor');
      if (data?.error) throw new Error(data.error);

      const userText: string = data.userText || '';
      const replyText: string = data.replyText || '';
      const audioB64: string = data.audio || '';
      const audioMime: string = data.mimeType || 'audio/L16;codec=pcm;rate=24000';

      historyRef.current = ([
        ...historyRef.current,
        { role: 'user' as const, content: userText },
        { role: 'assistant' as const, content: replyText },
      ]).slice(-16);

      setTranscript(prev => `${prev}\nVocê: ${userText}\nCasven: ${replyText}\n`);
      setStatus('🕯 Casven fala.');

      // Play audio (Gemini TTS returns raw PCM 16 by default)
      if (audioB64) {
        const bytes = decodeBase64(audioB64);
        if (audioMime.includes('pcm') || audioMime.includes('L16')) {
          const rate = pcmRateFromMime(audioMime, 24000);
          scheduleAudioChunk(bytes, rate);
        } else {
          // Attempt decoding as regular audio (mp3/wav/opus)
          if (!playbackCtxRef.current) playbackCtxRef.current = new AudioContext();
          const ab = new ArrayBuffer(bytes.byteLength);
          new Uint8Array(ab).set(bytes);
          const buf = await playbackCtxRef.current.decodeAudioData(ab);
          const src = playbackCtxRef.current.createBufferSource();
          src.buffer = buf;
          src.connect(playbackCtxRef.current.destination);
          src.start();
        }
      }
      setTimeout(() => setStatus('Segure o botão para falar de novo.'), 800);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Falha na resposta', description: e?.message || 'Erro', variant: 'destructive' });
      setStatus('Segure o botão para tentar outra vez.');
    } finally {
      setProcessing(false);
    }
  };

  // Cleanup on unmount / mode switch
  useEffect(() => () => { stopLive(); stopTurn(); }, [stopLive, stopTurn]);
  useEffect(() => {
    // When model changes, end any active session
    stopLive();
    stopTurn();
    setTranscript('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.model]);

  const canUse = config.enabled || isAdmin;

  return (
    <div className="max-w-3xl mx-auto" style={{ fontFamily: "'EB Garamond', serif", color: '#f0ddb0' }}>
      <div className="mb-6">
        <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--vm-font-display)", color: '#c3a45e' }}>
          🕯 Voz — Lembrança de Casven
        </h2>
        <p className="text-sm opacity-80">
          A voz de um velho escriba que voltou do Fosso. Fale com ele. Ele responderá — quando quiser, com o que puder dizer.
        </p>
      </div>

      {isAdmin && (
        <div className="rounded p-4 mb-6" style={{ border: '1px solid #33303f', background: 'rgba(201,148,58,0.05)' }}>
          <div className="text-[0.65rem] uppercase tracking-widest mb-3" style={{ color: '#c3a45e', fontFamily: 'var(--vm-font-heading)' }}>
            ⚙ Controles do Mestre
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => saveConfig({ enabled: e.target.checked })}
                disabled={saving}
              />
              <span>Comunicação {config.enabled ? 'LIGADA' : 'DESLIGADA'}</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span>Modelo:</span>
              <select
                value={config.model}
                onChange={(e) => saveConfig({ model: e.target.value as ModelId })}
                disabled={saving}
                className="rounded px-2 py-1 text-sm"
                style={{ background: '#13121b', color: '#f0ddb0', border: '1px solid #33303f' }}
              >
                <option value="gemini-3.1-flash-live-preview">gemini-3.1-flash-live-preview (Live, fluxo contínuo)</option>
                <option value="gemini-3.1-flash-tts-preview">gemini-3.1-flash-tts-preview (Push-to-talk via deepseek+TTS)</option>
              </select>
            </label>
          </div>
          <p className="text-[0.7rem] opacity-60 mt-3">
            • <b>Live</b>: WebSocket direto ao Gemini; fala e escuta continuamente.<br/>
            • <b>TTS</b>: segure para falar; a fala é transcrita, o texto do Casven vem do deepseek-v4-flash (OpenRouter) e o áudio é gerado pelo Gemini TTS com voz Algenib.
          </p>
        </div>
      )}

      {!canUse && (
        <div className="rounded p-6 text-center" style={{ border: '1px dashed #33303f', color: '#8c8478' }}>
          A voz de Casven está silenciosa no momento. Aguarde o mestre acender a vela.
        </div>
      )}

      {canUse && (
        <div className="rounded p-6" style={{ border: '1px solid #33303f', background: 'rgba(0,0,0,0.35)' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl" aria-hidden>{active ? '🕯' : '🪔'}</div>
            <div className="text-sm min-h-[1.25rem] opacity-80 text-center">
              {status || (active
                ? (isTurnMode ? 'Segure o botão para falar.' : 'Fale com Casven.')
                : 'Aperte para começar.')}
            </div>

            {!isTurnMode && !active && (
              <Button
                onClick={startLive}
                disabled={connecting}
                style={{ background: '#5c3010', color: '#f0ddb0', border: '1px solid #c3a45e' }}
              >
                {connecting ? 'Conectando…' : '🎙 Falar com a Lembrança'}
              </Button>
            )}
            {!isTurnMode && active && (
              <Button
                onClick={stopLive}
                style={{ background: '#9c2620', color: '#f0ddb0', border: '1px solid #c3a45e' }}
              >
                ✕ Encerrar
              </Button>
            )}

            {isTurnMode && !active && (
              <Button
                onClick={enterTurnMode}
                disabled={connecting}
                style={{ background: '#5c3010', color: '#f0ddb0', border: '1px solid #c3a45e' }}
              >
                {connecting ? 'Preparando…' : '🕯 Abrir conversa'}
              </Button>
            )}
            {isTurnMode && active && (
              <div className="flex flex-col items-center gap-3">
                <button
                  onMouseDown={startTurnRecording}
                  onMouseUp={stopTurnRecording}
                  onMouseLeave={recording ? stopTurnRecording : undefined}
                  onTouchStart={(e) => { e.preventDefault(); startTurnRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopTurnRecording(); }}
                  disabled={processing}
                  className="select-none rounded-full px-8 py-6 text-lg transition"
                  style={{
                    background: recording ? '#9c2620' : '#5c3010',
                    color: '#f0ddb0',
                    border: '2px solid #c3a45e',
                    boxShadow: recording ? '0 0 24px rgba(195,164,94,0.5)' : 'none',
                    opacity: processing ? 0.6 : 1,
                    cursor: processing ? 'wait' : 'pointer',
                  }}
                >
                  {recording ? '🔴 Solte para enviar' : processing ? '⌛ Aguardando…' : '🎙 Segure para falar'}
                </button>
                <Button
                  onClick={stopTurn}
                  variant="outline"
                  className="text-sm"
                  style={{ borderColor: '#33303f', color: '#c9b98a', background: 'transparent' }}
                >
                  ✕ Encerrar conversa
                </Button>
              </div>
            )}

            {transcript && (
              <details className="w-full mt-4" open>
                <summary className="text-xs opacity-60 cursor-pointer">Transcrição</summary>
                <pre className="whitespace-pre-wrap text-sm mt-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: '#c9b98a', maxHeight: '30vh', overflow: 'auto' }}>{transcript}</pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
