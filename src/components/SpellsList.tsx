import { useState, useMemo } from 'react';
import { spells, spellSchools, spellClasses } from '@/data/spells';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PageHeader } from '@/components/fantasy';

export default function SpellsList() {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [ritualOnly, setRitualOnly] = useState(false);

  const filtered = useMemo(() => {
    return spells.filter(s => {
      if (selectedLevel !== null && s.level !== selectedLevel) return false;
      if (selectedSchool !== 'all' && s.school !== selectedSchool) return false;
      if (selectedClass !== 'all' && !s.classes.includes(selectedClass)) return false;
      if (ritualOnly && !s.ritual) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.nameEN.toLowerCase().includes(q) || s.namePT.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedLevel, selectedSchool, selectedClass, ritualOnly]);

  const grouped = useMemo(() => {
    const g: Record<number, typeof spells> = {};
    for (const s of filtered) {
      if (!g[s.level]) g[s.level] = [];
      g[s.level].push(s);
    }
    return g;
  }, [filtered]);

  return (
    <div>
      <PageHeader icon="📖" title="Lista de Magias"
        subtitle={`D&D 5.5e (2024) · Cantrips e Magias de Nível 1 a 9 · ${spells.length} magias`} />

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <input
          type="text" placeholder="Buscar por nome ou descrição..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded text-sm outline-none"
          style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(201,148,58,0.08)', border: '1px solid #33303f', color: '#f0ddb0' }}
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#8c8478', fontFamily: "var(--vm-font-heading)" }}>Nível:</span>
          <FilterBtn label="Todos" active={selectedLevel === null} onClick={() => setSelectedLevel(null)} />
          <FilterBtn label="Cantrip" active={selectedLevel === 0} onClick={() => setSelectedLevel(0)} />
          {[1,2,3,4,5,6,7,8,9].map(l => <FilterBtn key={l} label={`Nv ${l}`} active={selectedLevel === l} onClick={() => setSelectedLevel(l)} />)}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#8c8478', fontFamily: "var(--vm-font-heading)" }}>Escola:</span>
          <FilterBtn label="Todas" active={selectedSchool === 'all'} onClick={() => setSelectedSchool('all')} />
          {spellSchools.map(s => <FilterBtn key={s} label={s} active={selectedSchool === s} onClick={() => setSelectedSchool(s)} />)}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#8c8478', fontFamily: "var(--vm-font-heading)" }}>Classe:</span>
          <FilterBtn label="Todas" active={selectedClass === 'all'} onClick={() => setSelectedClass('all')} />
          {spellClasses.map(c => <FilterBtn key={c} label={c} active={selectedClass === c} onClick={() => setSelectedClass(c)} />)}
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setRitualOnly(!ritualOnly)}
            className="px-3 py-1.5 rounded text-xs transition-all"
            style={{
              fontFamily: "var(--vm-font-heading)",
              background: ritualOnly ? 'rgba(90,60,180,0.3)' : 'rgba(201,148,58,0.05)',
              color: ritualOnly ? '#c4a0ff' : '#8c8478',
              border: ritualOnly ? '1px solid #8060c0' : '1px solid #33303f',
            }}>🕯 Apenas Rituais</button>
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: '#8c8478' }}>{filtered.length} magia(s) encontrada(s)</p>

      {Object.entries(grouped).sort(([a],[b]) => +a - +b).map(([level, items]) => (
        <div key={level} className="mb-6">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e', borderColor: '#33303f' }}>
            {+level === 0 ? 'Cantrips' : `Nível ${level}`} ({items.length} magias)
          </h3>
          <Accordion type="multiple" className="space-y-1">
            {items.map(spell => (
              <AccordionItem key={spell.nameEN} value={spell.nameEN} className="border-0">
                <AccordionTrigger className="py-2.5 px-3 rounded hover:no-underline" style={{
                  fontFamily: "var(--vm-font-body)",
                  color: '#f0ddb0',
                  background: 'rgba(201,148,58,0.06)',
                  border: '1px solid #1c1a26',
                }}>
                  <span className="text-left flex flex-wrap items-center gap-2">
                    <span className="font-semibold" style={{ color: '#e2c98f' }}>{spell.nameEN}</span>
                    <span className="text-sm" style={{ color: '#8c8478' }}>({spell.namePT})</span>
                    {spell.ritual && <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(90,60,180,0.3)', color: '#c4a0ff', border: '1px solid #5a3cb4' }}>Ritual</span>}
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,148,58,0.1)', color: '#968a72', border: '1px solid #33303f' }}>{spell.school}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pt-2 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <InfoTag label="Tempo" value={spell.castingTime} />
                    <InfoTag label="Alcance" value={spell.range} />
                    <InfoTag label="Duração" value={spell.duration} />
                    <InfoTag label="Componentes" value={spell.components} />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {spell.classes.map(c => (
                      <span key={c} className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,148,58,0.12)', color: '#c3a45e', border: '1px solid #33303f' }}>{c}</span>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--vm-font-body)", color: '#c4b08a' }}>
                    {spell.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
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
