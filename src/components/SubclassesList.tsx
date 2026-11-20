import { useState, useMemo } from 'react';
import { subclasses, classNames } from '@/data/subclasses';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PageHeader } from '@/components/fantasy';

export default function SubclassesList() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  const filtered = useMemo(() => {
    return subclasses.filter(sc => {
      if (selectedClass !== 'all' && sc.classNamePT !== selectedClass) return false;
      if (selectedRole !== 'all' && sc.role !== selectedRole) return false;
      if (search) {
        const q = search.toLowerCase();
        return sc.nameEN.toLowerCase().includes(q) || sc.namePT.toLowerCase().includes(q) || sc.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedClass, selectedRole]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach(sc => {
      const list = map.get(sc.classNamePT) || [];
      list.push(sc);
      map.set(sc.classNamePT, list);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <PageHeader icon="🛡" title="Subclasses"
        subtitle={`D&D 5.5e (2024) · ${subclasses.length} subclasses · 12 classes · 4 por classe`} />

      <div className="space-y-3 mb-6">
        <input
          type="text" placeholder="Buscar por nome ou descrição..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded text-sm outline-none"
          style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(201,148,58,0.08)', border: '1px solid #33303f', color: '#f0ddb0' }}
        />
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#8c8478', fontFamily: "var(--vm-font-heading)" }}>Classe:</span>
          <FilterBtn label="Todas" active={selectedClass === 'all'} onClick={() => setSelectedClass('all')} />
          {classNames.map(cn => (
            <FilterBtn key={cn} label={cn} active={selectedClass === cn} onClick={() => setSelectedClass(cn)} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs self-center" style={{ color: '#8c8478', fontFamily: "var(--vm-font-heading)" }}>Papel:</span>
          <FilterBtn label="Todos" active={selectedRole === 'all'} onClick={() => setSelectedRole('all')} />
          <FilterBtn label="Marcial" active={selectedRole === 'Marcial'} onClick={() => setSelectedRole('Marcial')} />
          <FilterBtn label="Conjurador" active={selectedRole === 'Conjurador'} onClick={() => setSelectedRole('Conjurador')} />
          <FilterBtn label="Híbrido" active={selectedRole === 'Híbrido'} onClick={() => setSelectedRole('Híbrido')} />
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: '#8c8478' }}>{filtered.length} subclasse(s) encontrada(s)</p>

      <Accordion type="multiple" className="space-y-3">
        {[...grouped.entries()].map(([className, scs]) => (
          <AccordionItem key={className} value={className} className="border-0">
            <AccordionTrigger className="py-3 px-4 rounded hover:no-underline" style={{
              fontFamily: "var(--vm-font-heading)", color: '#e2c98f',
              background: 'rgba(201,148,58,0.1)', border: '1px solid #33303f',
              fontSize: '1.1rem',
            }}>
              <span className="text-left flex items-center gap-2">
                <span className="font-bold">{className}</span>
                <span className="text-xs" style={{ color: '#8c8478' }}>({scs.length} subclasses)</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-3 pb-2">
              <Accordion type="multiple" className="space-y-2">
                {scs.map(sc => (
                  <AccordionItem key={sc.nameEN} value={sc.nameEN} className="border-0">
                    <AccordionTrigger className="py-2 px-3 rounded hover:no-underline" style={{
                      fontFamily: "var(--vm-font-body)", color: '#f0ddb0',
                      background: 'rgba(201,148,58,0.05)', border: '1px solid #1c1a26',
                    }}>
                      <span className="text-left flex flex-wrap items-center gap-2">
                        <span className="font-semibold" style={{ color: '#e2c98f', fontFamily: "var(--vm-font-heading)" }}>{sc.namePT}</span>
                        <span className="text-xs" style={{ color: '#8c8478' }}>({sc.nameEN})</span>
                        <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{
                          background: sc.role === 'Conjurador' ? 'rgba(90,60,180,0.3)' : sc.role === 'Híbrido' ? 'rgba(58,148,201,0.2)' : 'rgba(201,58,58,0.2)',
                          color: sc.role === 'Conjurador' ? '#c4a0ff' : sc.role === 'Híbrido' ? '#80c0e0' : '#e08080',
                          border: `1px solid ${sc.role === 'Conjurador' ? '#5a3cb4' : sc.role === 'Híbrido' ? '#3a8cb0' : '#8b3030'}`,
                        }}>{sc.role}</span>
                        <span className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,148,58,0.1)', color: '#968a72', border: '1px solid #33303f' }}>Nv {sc.levelGained}+</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pt-2 pb-3">
                      <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--vm-font-body)", color: '#c4b08a' }}>
                        {sc.description}
                      </p>
                      <h5 className="text-xs font-bold mb-2 pb-1 border-b" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e', borderColor: '#33303f' }}>
                        Habilidades da Subclasse
                      </h5>
                      <div className="space-y-2">
                        {sc.features.map((f, i) => (
                          <div key={i} className="rounded px-3 py-2" style={{ background: 'rgba(201,148,58,0.04)', border: '1px solid #15141c' }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[0.6rem] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(139,26,26,0.3)', color: '#e08080', border: '1px solid #5a1515' }}>Nv {f.level}</span>
                              <span className="text-sm font-semibold" style={{ color: '#e2c98f', fontFamily: "var(--vm-font-heading)" }}>{f.name}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: '#a09070', fontFamily: "var(--vm-font-body)" }}>{f.description}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
