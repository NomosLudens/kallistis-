export interface CombatResource {
  label: string;
  uses: string;
  refresh: 'DC' | 'DL' | 'DC/DL' | 'turno' | 'dia' | string;
}

export interface CombatHighlightData {
  ac: string;
  acSub?: string;
  hp: string;
  attackBonus?: string;
  attackDamage?: string;
  spellAttack?: string;
  spellDC?: string;
  resources?: CombatResource[];
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
}

function StatCard({ label, value, sub }: CardProps) {
  return (
    <div
      className="text-center py-3 px-2 rounded"
      style={{
        background: 'linear-gradient(180deg, #f0ddb0 0%, #dfc882 100%)',
        border: '2px solid #c3a45e',
        boxShadow: '0 2px 6px rgba(92,48,16,0.2)',
        minWidth: 0,
      }}
    >
      <div
        className="text-[0.6rem] uppercase tracking-wider mb-1"
        style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}
      >
        {label}
      </div>
      <div
        className="font-bold leading-none"
        style={{
          fontFamily: "var(--vm-font-heading)",
          color: '#13121b',
          fontSize: 'clamp(1.1rem, 2.5vw, 1.7rem)',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-[0.65rem] mt-1 leading-tight"
          style={{ fontFamily: "var(--vm-font-heading)", color: '#9c2620', fontWeight: 600 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function ResourceChip({ resource }: { resource: CombatResource }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)',
        border: '1px solid #c3a45e',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      <span
        className="text-[0.7rem] font-semibold leading-none"
        style={{ fontFamily: "var(--vm-font-heading)", color: '#f0ddb0' }}
      >
        {resource.label}
      </span>
      <span
        className="text-[0.75rem] font-bold leading-none"
        style={{ fontFamily: "var(--vm-font-heading)", color: '#ffd966' }}
      >
        {resource.uses}
      </span>
      {resource.refresh && (
        <span
          className="text-[0.6rem] leading-none px-1.5 py-0.5 rounded"
          style={{
            fontFamily: "var(--vm-font-heading)",
            color: '#ffb3b3',
            background: 'rgba(139,26,26,0.5)',
            border: '1px solid rgba(255,179,179,0.3)',
          }}
        >
          {resource.refresh}
        </span>
      )}
    </div>
  );
}

export default function CombatHighlight({ data }: { data: CombatHighlightData }) {
  const cards: CardProps[] = [
    { label: 'CA', value: data.ac, sub: data.acSub },
    { label: 'PV', value: data.hp },
  ];

  if (data.attackBonus) {
    cards.push({
      label: 'Ataque Físico',
      value: data.attackBonus,
      sub: data.attackDamage,
    });
  }

  if (data.spellAttack || data.spellDC) {
    cards.push({
      label: 'Magia',
      value: data.spellAttack || `CD ${data.spellDC}`,
      sub: data.spellAttack && data.spellDC ? `CD ${data.spellDC}` : undefined,
    });
  }

  return (
    <div className="rounded overflow-hidden mt-4" style={{
      background: 'linear-gradient(135deg, #f5e8c0 0%, #e8d098 100%)',
      border: '1px solid #a07840',
    }}>
      <div className="px-3.5 py-2 text-[0.75rem] tracking-wider" style={{
        fontFamily: "var(--vm-font-heading)",
        color: '#e2c98f',
        background: 'linear-gradient(135deg, #5c3010 0%, #3d2010 100%)',
      }}>
        🛡 COMBATE EM DESTAQUE
      </div>
      <div
        className="p-3.5 grid gap-2.5"
        style={{
          gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
        }}
      >
        {cards.map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>
      {data.resources && data.resources.length > 0 && (
        <div
          className="px-3.5 pb-3.5 pt-1"
          style={{
            borderTop: '1px dashed #a07840',
          }}
        >
          <div
            className="text-[0.65rem] uppercase tracking-wider mb-2 mt-2"
            style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010', fontWeight: 700 }}
          >
            ⏳ Recursos Limitados
          </div>
          <div className="flex flex-wrap gap-2">
            {data.resources.map((r, i) => (
              <ResourceChip key={i} resource={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
