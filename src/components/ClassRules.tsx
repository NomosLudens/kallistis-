import { useState, useMemo } from 'react';
import { dndClasses } from '@/data/classes';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PageHeader } from '@/components/fantasy';

export default function ClassRules() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filtered = useMemo(() => {
    return dndClasses.filter(c => {
      if (selectedRole !== 'all' && c.role !== selectedRole) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.nameEN.toLowerCase().includes(q) || c.namePT.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedRole]);

  return (
    <div>
      <PageHeader icon="📜" title="Regras de Classe"
        subtitle={`D&D 5.5e (2024) · ${dndClasses.length} classes · Progressão nível 1–20`} />

      <div className="space-y-3 mb-6">
        <input
          type="text" placeholder="Buscar por nome ou descrição..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded text-sm outline-none"
          style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(201,148,58,0.08)', border: '1px solid #33303f', color: '#f0ddb0' }}
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#8c8478', fontFamily: "var(--vm-font-heading)" }}>Papel:</span>
          <FilterBtn label="Todos" active={selectedRole === 'all'} onClick={() => setSelectedRole('all')} />
          <FilterBtn label="Marcial" active={selectedRole === 'Marcial'} onClick={() => setSelectedRole('Marcial')} />
          <FilterBtn label="Conjurador" active={selectedRole === 'Conjurador'} onClick={() => setSelectedRole('Conjurador')} />
          <FilterBtn label="Híbrido" active={selectedRole === 'Híbrido'} onClick={() => setSelectedRole('Híbrido')} />
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: '#8c8478' }}>{filtered.length} classe(s) encontrada(s)</p>

      <Accordion type="multiple" className="space-y-2">
        {filtered.map(cls => (
          <AccordionItem key={cls.nameEN} value={cls.nameEN} className="border-0">
            <AccordionTrigger className="py-3 px-4 rounded hover:no-underline" style={{
              fontFamily: "var(--vm-font-body)", color: '#f0ddb0',
              background: 'rgba(201,148,58,0.06)', border: '1px solid #1c1a26',
            }}>
              <span className="text-left flex flex-wrap items-center gap-2">
                <span className="font-bold text-lg" style={{ color: '#e2c98f', fontFamily: "var(--vm-font-heading)" }}>{cls.namePT}</span>
                <span className="text-sm" style={{ color: '#8c8478' }}>({cls.nameEN})</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{
                  background: cls.role === 'Conjurador' ? 'rgba(90,60,180,0.3)' : cls.role === 'Híbrido' ? 'rgba(58,148,201,0.2)' : 'rgba(201,58,58,0.2)',
                  color: cls.role === 'Conjurador' ? '#c4a0ff' : cls.role === 'Híbrido' ? '#80c0e0' : '#e08080',
                  border: `1px solid ${cls.role === 'Conjurador' ? '#5a3cb4' : cls.role === 'Híbrido' ? '#3a8cb0' : '#8b3030'}`,
                }}>{cls.role}</span>
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,148,58,0.1)', color: '#968a72', border: '1px solid #33303f' }}>d{cls.hitDie}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-3 pb-4">
              {/* Description */}
              <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--vm-font-body)", color: '#c4b08a' }}>
                {cls.description}
              </p>

              {/* Core Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <InfoTag label="Dado de Vida" value={`d${cls.hitDie}`} />
                <InfoTag label="Atributo" value={cls.primaryAbility} />
                <InfoTag label="Salvaguardas" value={cls.savingThrows} />
                <InfoTag label="Proficiências" value={cls.armorWeaponProf} />
              </div>

              {/* Features */}
              <h4 className="text-sm font-bold mb-2 pb-1 border-b" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e', borderColor: '#33303f' }}>
                Habilidades de Classe
              </h4>
              <div className="space-y-2 mb-4">
                {cls.features.map((f, i) => (
                  <div key={i} className="rounded px-3 py-2" style={{ background: 'rgba(201,148,58,0.04)', border: '1px solid #15141c' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.6rem] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(139,26,26,0.3)', color: '#e08080', border: '1px solid #5a1515' }}>Nv {f.level}</span>
                      <span className="text-sm font-semibold" style={{ color: '#e2c98f', fontFamily: "var(--vm-font-heading)" }}>{f.name}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#a09070', fontFamily: "var(--vm-font-body)" }}>{f.description}</p>
                  </div>
                ))}
              </div>

              {/* Level Progression Table */}
              <h4 className="text-sm font-bold mb-2 pb-1 border-b" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e', borderColor: '#33303f' }}>
                Tabela de Progressão
              </h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #33303f' }}>
                      <th className="px-2 py-1.5 text-left" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Nv</th>
                      <th className="px-2 py-1.5 text-left" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Prof.</th>
                      <th className="px-2 py-1.5 text-left" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Habilidades</th>
                      {cls.levelTable[0]?.cantrips !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Cantrips</th>}
                      {cls.levelTable[0]?.rages !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Fúrias</th>}
                      {cls.levelTable[0]?.rageDamage !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>+Dano</th>}
                      {cls.levelTable[0]?.sneakAttack !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Furtivo</th>}
                      {cls.levelTable[0]?.martialArts !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Art. Marcial</th>}
                      {cls.levelTable[0]?.ki !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Ki</th>}
                      {cls.levelTable[0]?.sorceryPoints !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Pontos</th>}
                      {cls.levelTable[0]?.invocations !== undefined && <th className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)" }}>Invoc.</th>}
                      {cls.spellSlotHeaders && cls.spellSlotHeaders.map(h => (
                        <th key={h} className="px-1 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)", fontSize: '0.6rem' }}>{h}</th>
                      ))}
                      {cls.levelTable[0]?.extras && Object.keys(cls.levelTable[0].extras).map(k => (
                        <th key={k} className="px-2 py-1.5 text-center" style={{ color: '#c3a45e', fontFamily: "var(--vm-font-heading)", fontSize: '0.6rem' }}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cls.levelTable.map(row => (
                      <tr key={row.level} style={{ borderBottom: '1px solid #15141c', background: row.level % 2 === 0 ? 'rgba(201,148,58,0.03)' : 'transparent' }}>
                        <td className="px-2 py-1" style={{ color: '#e2c98f', fontWeight: 'bold' }}>{row.level}</td>
                        <td className="px-2 py-1" style={{ color: '#968a72' }}>+{row.profBonus}</td>
                        <td className="px-2 py-1" style={{ color: '#c4b08a', fontFamily: "var(--vm-font-body)", maxWidth: '200px' }}>{row.features}</td>
                        {row.cantrips !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.cantrips}</td>}
                        {row.rages !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.rages}</td>}
                        {row.rageDamage !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>+{row.rageDamage}</td>}
                        {cls.levelTable[0]?.sneakAttack !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.sneakAttack}</td>}
                        {cls.levelTable[0]?.martialArts !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.martialArts}</td>}
                        {cls.levelTable[0]?.ki !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.ki || '—'}</td>}
                        {cls.levelTable[0]?.sorceryPoints !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.sorceryPoints || '—'}</td>}
                        {cls.levelTable[0]?.invocations !== undefined && <td className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{row.invocations || '—'}</td>}
                        {cls.spellSlotHeaders && row.spellSlots?.map((s, i) => (
                          <td key={i} className="px-1 py-1 text-center" style={{ color: s > 0 ? '#968a72' : '#33303f' }}>{s || '—'}</td>
                        ))}
                        {row.extras && Object.values(row.extras).map((v, i) => (
                          <td key={i} className="px-2 py-1 text-center" style={{ color: '#968a72' }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subclasses */}
              <h4 className="text-sm font-bold mb-2 pb-1 border-b" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e', borderColor: '#33303f' }}>
                Subclasses
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cls.subclasses.map(sc => (
                  <div key={sc.name} className="rounded px-3 py-2" style={{ background: 'rgba(201,148,58,0.04)', border: '1px solid #15141c' }}>
                    <span className="text-xs font-semibold" style={{ color: '#e2c98f' }}>{sc.name}</span>
                    <p className="text-xs mt-0.5" style={{ color: '#8c8478', fontFamily: "var(--vm-font-body)" }}>{sc.description}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1 rounded text-[0.7rem] transition-all" style={{
      fontFamily: "var(--vm-font-heading)",
      background: active ? 'rgba(201,148,58,0.25)' : 'rgba(201,148,58,0.05)',
      color: active ? '#f0ddb0' : '#8c8478',
      border: active ? '1px solid #c3a45e' : '1px solid #33303f',
    }}>{label}</button>
  );
}

function InfoTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs rounded px-2 py-1" style={{ background: 'rgba(201,148,58,0.06)', border: '1px solid #1c1a26' }}>
      <span style={{ color: '#8c8478' }}>{label}: </span>
      <span style={{ color: '#c4b08a' }}>{value}</span>
    </div>
  );
}
