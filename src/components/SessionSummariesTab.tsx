import { useState } from 'react';
import Session1Summary from './Session1Summary';
import Session2Summary from './Session2Summary';
import Session3Summary from './Session3Summary';
import Session4Summary from './Session4Summary';
import Session5Summary from './Session5Summary';
import Session6Summary from './Session6Summary';
import Session7Summary from './Session7Summary';
import Session8Summary from './Session8Summary';

const SUB_TABS: { id: string; label: string; render: () => JSX.Element }[] = [
  { id: 's1', label: '📖 Sessão 1 — 05/04/26', render: () => <Session1Summary /> },
  { id: 's2', label: '📖 Sessão 2 — 19/04/26', render: () => <Session2Summary /> },
  { id: 's3', label: '📖 Sessão 3 — 03/05/26', render: () => <Session3Summary /> },
  { id: 's4', label: '📖 Sessão 4 — 17/05/26', render: () => <Session4Summary /> },
  { id: 's5', label: '📖 Sessão 5 — 31/05/26', render: () => <Session5Summary /> },
  { id: 's6', label: '📖 Sessão 6 — 20/06/26', render: () => <Session6Summary /> },
  { id: 's7', label: '📖 Sessão 7 — 28/06/26', render: () => <Session7Summary /> },
  { id: 's8', label: '📖 Sessão 8 — 12/07/26', render: () => <Session8Summary /> },
];

export default function SessionSummariesTab() {
  const [active, setActive] = useState<string>(SUB_TABS[SUB_TABS.length - 1].id);
  const current = SUB_TABS.find(t => t.id === active) ?? SUB_TABS[0];

  return (
    <div className="space-y-5">
      <div className="text-center pb-2">
        <h2 className="text-2xl md:text-3xl tracking-wide" style={{
          fontFamily: "var(--vm-font-display)", color: '#c3a45e',
          textShadow: '0 0 25px rgba(201,148,58,0.35)',
        }}>📜 Resumo de Sessões</h2>
        <p className="text-xs tracking-[0.2em] mt-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#7e766a' }}>
          Registros canônicos de cada sessão jogada
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center pb-2 border-b" style={{ borderColor: '#33303f' }}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="px-3 py-1.5 rounded-sm text-[0.75rem] transition-all"
            style={{
              fontFamily: "var(--vm-font-heading)",
              letterSpacing: '0.1em',
              color: active === t.id ? '#f0ddb0' : '#8c8478',
              background: active === t.id ? 'rgba(201,148,58,0.18)' : 'rgba(201,148,58,0.04)',
              border: `1px solid ${active === t.id ? '#c3a45e' : '#33303f'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>{current.render()}</div>
    </div>
  );
}
