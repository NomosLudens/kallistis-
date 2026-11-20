import { useState, useMemo } from 'react';
import { feats, featCategories, featCategoryLabels } from '@/data/feats';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PageHeader } from '@/components/fantasy';

export default function FeatsList() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return feats.filter(f => {
      if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.nameEN.toLowerCase().includes(q) || f.namePT.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, selectedCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof feats> = {};
    for (const f of filtered) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, [filtered]);

  return (
    <div>
      <PageHeader icon="🎯" title="Talentos"
        subtitle={`D&D 5.5e (2024) · ${feats.length} talentos oficiais do Player's Handbook 2024`} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou descrição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded text-sm outline-none"
          style={{ fontFamily: "var(--vm-font-body)", background: 'rgba(201,148,58,0.08)', border: '1px solid #33303f', color: '#f0ddb0' }}
        />
        <div className="flex gap-2 flex-wrap">
          <FilterBtn label="Todos" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
          {featCategories.map(cat => (
            <FilterBtn key={cat} label={featCategoryLabels[cat]} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
          ))}
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: '#8c8478' }}>{filtered.length} talento(s) encontrado(s)</p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b" style={{ fontFamily: "var(--vm-font-heading)", color: '#c3a45e', borderColor: '#33303f' }}>
            {featCategoryLabels[category]} ({items.length})
          </h3>
          <Accordion type="multiple" className="space-y-1">
            {items.map(feat => (
              <AccordionItem key={feat.nameEN} value={feat.nameEN} className="border-0">
                <AccordionTrigger className="py-2.5 px-3 rounded hover:no-underline" style={{
                  fontFamily: "var(--vm-font-body)",
                  color: '#f0ddb0',
                  background: 'rgba(201,148,58,0.06)',
                  border: '1px solid #1c1a26',
                }}>
                  <span className="text-left">
                    <span className="font-semibold" style={{ color: '#e2c98f' }}>{feat.nameEN}</span>
                    <span className="ml-2 text-sm" style={{ color: '#8c8478' }}>({feat.namePT})</span>
                    {feat.prerequisite && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(139,26,26,0.3)', color: '#d4a574', border: '1px solid #33303f' }}>
                        {feat.prerequisite}
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-3 pt-2 pb-3">
                  <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--vm-font-body)", color: '#c4b08a' }}>
                    {feat.description}
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
    <button onClick={onClick} className="px-3 py-1.5 rounded text-xs transition-all" style={{
      fontFamily: "var(--vm-font-heading)",
      background: active ? 'rgba(201,148,58,0.25)' : 'rgba(201,148,58,0.05)',
      color: active ? '#f0ddb0' : '#8c8478',
      border: active ? '1px solid #c3a45e' : '1px solid #33303f',
    }}>{label}</button>
  );
}
