import * as React from 'react';

/**
 * Primitivos visuais dark-fantasy compartilhados (Velmoor).
 * Apenas apresentação — sem lógica de dados. Tudo construído sobre os
 * tokens definidos em src/index.css (--vm-*).
 */

/* ═══ PANEL (moldura escura padrão das ferramentas) ═══ */
export function Panel({
  title, subtitle, icon, accent = 'var(--vm-gold)', headerRight, children, className = '', style,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`vm-panel overflow-hidden ${className}`} style={style}>
      {(title || headerRight) && (
        <div className="vm-panel-header px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${accent}22 0%, transparent 100%)`, borderBottomColor: accent + '55' }}>
          <div className="min-w-0">
            <h2 className="text-[clamp(0.95rem,2vw,1.2rem)] tracking-wide flex items-center gap-2"
              style={{ fontFamily: 'var(--vm-font-heading)', color: accent }}>
              {icon}{title}
            </h2>
            {subtitle && <p className="text-[0.78rem] italic mt-0.5" style={{ color: 'var(--vm-gold-dim)' }}>{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}

/* ═══ PAGE HEADER (título de aba com ornamento) ═══ */
export function PageHeader({ icon, title, subtitle }: { icon?: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-[clamp(1.4rem,3vw,2rem)] tracking-wide" style={{
        fontFamily: 'var(--vm-font-display)', color: 'var(--vm-gold)',
        textShadow: '0 0 25px rgba(201,148,58,0.4), 0 2px 4px rgba(0,0,0,0.8)',
      }}>{icon} {title}</h1>
      <div className="flex items-center justify-center gap-2 mt-2" aria-hidden="true">
        <span className="h-px w-14 sm:w-20" style={{ background: 'linear-gradient(90deg, transparent, var(--vm-gold))' }} />
        <span className="text-[0.5rem]" style={{ color: 'var(--vm-gold)' }}>◆</span>
        <span className="h-px w-14 sm:w-20" style={{ background: 'linear-gradient(90deg, var(--vm-gold), transparent)' }} />
      </div>
      {subtitle && <p className="text-sm mt-2" style={{ fontFamily: 'var(--vm-font-heading)', color: 'var(--vm-gold-dim)', letterSpacing: '0.04em' }}>{subtitle}</p>}
    </div>
  );
}

/* ═══ SECTION TITLE ═══ */
export function SectionTitle({ icon, children, accent = 'var(--vm-gold)' }: { icon?: React.ReactNode; children: React.ReactNode; accent?: string }) {
  return (
    <h3 className="vm-section-title text-[clamp(1rem,2vw,1.3rem)] mb-4 pb-2 flex items-center gap-2" style={{ color: accent, borderBottomColor: 'var(--vm-border)' }}>
      {icon} {children}
    </h3>
  );
}

/* ═══ CHIP / TAG ═══ */
export function Chip({ children, color = 'var(--vm-gold)', className = '' }: { children: React.ReactNode; color?: string; className?: string }) {
  return (
    <span className={`inline-block text-[0.68rem] px-2 py-0.5 rounded mr-1 mb-1 ${className}`}
      style={{ fontFamily: 'var(--vm-font-heading)', background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`, color }}>
      {children}
    </span>
  );
}

/* ═══ QUOTE (citação in-world) ═══ */
export function Quote({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="vm-quote text-center text-[0.85rem] leading-relaxed py-3 px-5 my-4"
      style={accent ? { borderLeftColor: accent, borderRightColor: accent } : undefined}>
      {children}
    </div>
  );
}

/* ═══ STATUS BADGE (unifica criação + level-up) ═══ */
export type VmStatusTone = 'progress' | 'ok' | 'warn' | 'danger' | 'feat';
const TONE_COLOR: Record<VmStatusTone, string> = {
  progress: 'var(--vm-status-progress)',
  ok: 'var(--vm-status-ok)',
  warn: 'var(--vm-status-warn)',
  danger: 'var(--vm-status-danger)',
  feat: 'var(--vm-status-feat)',
};

export function StatusBadge({ tone, children }: { tone: VmStatusTone; children: React.ReactNode }) {
  const color = TONE_COLOR[tone];
  return (
    <span className="text-[0.62rem] uppercase tracking-wider px-2 py-[3px] rounded whitespace-nowrap"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 45%, transparent)` }}>
      {children}
    </span>
  );
}

/* ═══ BUTTONS ═══ */
export function FantasyButton({
  variant = 'gold', className = '', children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'blood' | 'ghost' }) {
  const cls = variant === 'blood' ? 'vm-btn-blood' : variant === 'ghost' ? 'vm-btn-ghost' : 'vm-btn';
  return (
    <button {...rest} className={`${cls} px-4 py-2 text-[0.82rem] tracking-wide disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

/* ═══ INPUTS ═══ */
export const FantasyInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...rest }, ref) => (
    <input ref={ref} {...rest} className={`vm-input w-full px-3 py-2.5 text-[0.9rem] ${className}`} />
  ),
);
FantasyInput.displayName = 'FantasyInput';

export const FantasyTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...rest }, ref) => (
    <textarea ref={ref} {...rest} className={`vm-input w-full px-3 py-2.5 text-[0.9rem] resize-none ${className}`} style={{ fontFamily: 'var(--vm-font-body)' }} />
  ),
);
FantasyTextarea.displayName = 'FantasyTextarea';

/* ═══ CHAT BUBBLE (compartilhado pelos 3 chats de IA) ═══ */
export function ChatBubble({ role, accent = 'var(--vm-gold)', children }: { role: 'user' | 'assistant'; accent?: string; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[85%] px-3.5 py-2.5 rounded-[10px] text-[0.92rem] leading-relaxed prose prose-invert prose-sm max-w-none"
        style={{
          background: isUser ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'rgba(20,16,12,0.85)',
          border: `1px solid ${isUser ? `color-mix(in srgb, ${accent} 40%, transparent)` : 'rgba(201,148,58,0.2)'}`,
          color: '#d4c4a8',
        }}>
        {children}
      </div>
    </div>
  );
}

/* ═══ STEP PROGRESS (criação de personagem) ═══ */
export function StepProgress({ steps, currentIndex }: { steps: { key: string; label: string }[]; currentIndex: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const color = active ? 'var(--vm-gold-light)' : done ? 'var(--vm-status-ok)' : 'var(--vm-gold-faint)';
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded"
              style={{
                background: active ? 'rgba(201,148,58,0.15)' : 'transparent',
                border: `1px solid ${active ? 'rgba(201,148,58,0.5)' : 'transparent'}`,
              }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[0.55rem] font-bold shrink-0"
                style={{ background: done ? 'var(--vm-status-ok)' : active ? 'var(--vm-gold)' : 'transparent', color: done || active ? 'var(--vm-panel)' : color, border: `1px solid ${color}` }}>
                {done ? '✓' : i + 1}
              </span>
              <span className="text-[0.66rem] tracking-wide whitespace-nowrap" style={{ fontFamily: 'var(--vm-font-heading)', color }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <span className="text-[0.6rem]" style={{ color: 'var(--vm-gold-faint)' }}>›</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
