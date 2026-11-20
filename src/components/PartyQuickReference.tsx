import { Download, FileText } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { CharacterSummary, CharacterSheet } from '@/data/characters';
import { buildCharacterContext, type PartyEntry, type PartyTrait } from '@/lib/characterContext';
import { downloadPartyCsv } from '@/lib/exportPartyCsv';
import { downloadPartyDoc } from '@/lib/exportPartyDoc';

const sectionStyle = { background: 'rgba(240,221,176,0.5)', border: '1px solid rgba(160,120,64,0.4)' };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.7rem] font-bold tracking-wider mb-1.5 mt-2" style={{
      fontFamily: "var(--vm-font-heading)", color: '#5c3010',
    }}>{children}</div>
  );
}

function TraitBlock({ trait }: { trait: PartyTrait }) {
  return (
    <div className="mb-1.5 text-[0.72rem] leading-relaxed" style={{ color: '#4a3510' }}>
      <span className="font-bold" style={{ fontFamily: "var(--vm-font-heading)", color: '#9c2620' }}>{trait.name}: </span>
      {trait.desc}
    </div>
  );
}

function SpellTag({ spell }: { spell: PartyTrait }) {
  return (
    <div className="rounded p-2 text-[0.72rem]" style={{ background: 'rgba(139,100,30,0.08)', border: '1px solid rgba(139,100,30,0.25)', color: '#4a3510' }}>
      <span className="font-bold" style={{ fontFamily: "var(--vm-font-heading)", color: '#5c3010' }}>{spell.name}</span>
      {spell.desc ? <> — {spell.desc}</> : null}
    </div>
  );
}

function CharAccordionContent({ char }: { char: PartyEntry }) {
  return (
    <div className="text-[0.78rem] leading-relaxed" style={{ color: '#33303f' }}>
      {/* Combat stats from summary */}
      {char.combatStats?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {char.combatStats.map((s, i) => (
            <div key={i} className="text-center rounded py-1 px-2 text-[0.78rem] font-bold" style={{
              fontFamily: "var(--vm-font-heading)", background: '#9c2620', color: '#f0ddb0',
            }}>{s.value}<span className="block text-[0.55rem] font-normal" style={{ color: '#d4a860' }}>{s.label}</span></div>
          ))}
        </div>
      )}

      {/* Attributes */}
      {char.attributes?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {char.attributes.map((a, i) => (
            <div key={i} className="text-center text-[0.68rem] px-1.5 py-0.5 rounded min-w-[40px]" style={{
              fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.15)',
              border: '1px solid #c3a45e', color: '#33303f',
            }}>{a.value}<span className="block text-[0.55rem]" style={{ color: '#6a6458' }}>{a.label}</span></div>
          ))}
        </div>
      )}

      {char.skills && (
        <div className="text-[0.72rem] italic mb-2" style={{ color: '#4a3510' }}>
          <strong className="not-italic text-[0.65rem] mr-1" style={{ fontFamily: "var(--vm-font-heading)", color: '#33303f' }}>Perícias:</strong>{char.skills}
        </div>
      )}

      {char.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {char.tags.map((t, i) => (
            <span key={i} className="text-[0.62rem] px-[7px] py-[1px] rounded" style={{
              fontFamily: "var(--vm-font-heading)", background: 'rgba(139,100,30,0.12)',
              border: '1px solid rgba(139,100,30,0.4)', color: '#5c3010',
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Resources / combat highlight extras */}
      {(char.attackBonus || char.spellAttack || char.spellDC || char.resources?.length) && (
        <>
          <SectionLabel>⚔ Combate</SectionLabel>
          <div className="rounded p-2.5 mb-2 text-[0.72rem]" style={{ ...sectionStyle, color: '#4a3510' }}>
            {char.attackBonus && <div><strong style={{ color: '#9c2620' }}>Ataque físico:</strong> {char.attackBonus}{char.attackDamage ? ` · Dano ${char.attackDamage}` : ''}</div>}
            {char.spellAttack && <div><strong style={{ color: '#9c2620' }}>Atq Mágico:</strong> {char.spellAttack}{char.spellDC ? ` · CD ${char.spellDC}` : ''}</div>}
            {char.resources?.map((r, i) => (
              <div key={i}><strong style={{ color: '#9c2620' }}>{r.label}:</strong> {r.uses} ({r.refresh})</div>
            ))}
          </div>
        </>
      )}

      {/* Highlighted abilities (sheet.abilities.items) */}
      {char.highlightedAbilities.length > 0 && (
        <>
          <SectionLabel>⭐ Habilidades em Destaque{char.resourceSummary ? ` — ${char.resourceSummary}` : ''}</SectionLabel>
          <div className="rounded p-2.5 mb-2" style={sectionStyle}>
            {char.highlightedAbilities.map((t, i) => <TraitBlock key={i} trait={t} />)}
          </div>
        </>
      )}

      {/* Tables (e.g. Slots de Magia) */}
      {char.tableEntries.map((tbl, idx) => (
        <div key={`tbl-${idx}`}>
          <SectionLabel>📊 {tbl.panelTitle}</SectionLabel>
          <div className="rounded p-2.5 mb-2 text-[0.72rem]" style={{ ...sectionStyle, color: '#4a3510' }}>
            {tbl.rows.map((r, i) => (
              <div key={i}><strong style={{ color: '#9c2620' }}>{r.label}:</strong> {r.value}</div>
            ))}
          </div>
        </div>
      ))}

      {/* Generic trait panels (Habilidades, Traços Raciais, Talentos, Ataques, etc.) */}
      {char.panelTraits.map((p, idx) => (
        <div key={`panel-${idx}`}>
          <SectionLabel>{p.icon} {p.panelTitle}</SectionLabel>
          <div className="rounded p-2.5 mb-2" style={sectionStyle}>
            {p.traits.map((t, i) => <TraitBlock key={i} trait={t} />)}
          </div>
        </div>
      ))}

      {/* Attribute blocks (e.g. Saving Throws by attribute, custom stat blocks) */}
      {char.attributeBlocks.map((ab, idx) => (
        <div key={`attr-${idx}`}>
          <SectionLabel>📐 {ab.panelTitle}</SectionLabel>
          <div className="rounded p-2.5 mb-2 text-[0.72rem]" style={{ ...sectionStyle, color: '#4a3510' }}>
            {ab.rows.map((r, i) => (
              <div key={i}><strong style={{ color: '#9c2620' }}>{r.name}:</strong> {r.value} ({r.mod})</div>
            ))}
          </div>
        </div>
      ))}

      {/* Spell sections */}
      {char.spellSections.map((ss, idx) => (
        <div key={`spell-${idx}`}>
          {ss.sections.map((sec, j) => (
            <div key={j}>
              <SectionLabel>✨ {ss.panelTitle} — {sec.label}</SectionLabel>
              {sec.spells && sec.spells.length > 0 && (
                <div className="space-y-1 mb-2">
                  {sec.spells.map((name, k) => <SpellTag key={k} spell={{ name, desc: '' }} />)}
                </div>
              )}
              {sec.traits && sec.traits.length > 0 && (
                <div className="space-y-1 mb-2">
                  {sec.traits.map((t, k) => <SpellTag key={k} spell={t} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Magic items */}
      {[char.magicItem, ...(char.magicItems ?? [])].filter(Boolean).map((mi, mIdx) => (
        <div key={mIdx}>
          <SectionLabel>💎 Item Mágico — {mi!.title}{mi!.rarity ? ` (${mi!.rarity})` : ''}</SectionLabel>
          <div className="rounded p-2.5 mb-2" style={{ ...sectionStyle, borderLeft: '3px solid #c3a45e' }}>
            {mi!.description && (
              <div className="text-[0.72rem] italic mb-1.5" style={{ color: '#4a3510' }}>{mi!.description}</div>
            )}
            {mi!.passive && <TraitBlock trait={{ name: 'Passivo', desc: mi!.passive }} />}
            {mi!.charges && <TraitBlock trait={{ name: 'Cargas', desc: mi!.charges }} />}
            {mi!.abilities.map((p, i) => <TraitBlock key={i} trait={p} />)}
            {mi!.badges && mi!.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {mi!.badges.map((b, i) => (
                  <span key={i} className="text-[0.62rem] px-[7px] py-[1px] rounded" style={{
                    fontFamily: "var(--vm-font-heading)", background: 'rgba(160,120,64,0.2)',
                    border: '1px solid rgba(160,120,64,0.5)', color: '#5c3010',
                  }}>{b}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  summaries?: CharacterSummary[];
  sheets?: CharacterSheet[];
}

export default function PartyQuickReference({ summaries, sheets }: Props) {
  const { partyEntries } = buildCharacterContext(summaries ?? [], sheets ?? []);

  return (
    <div className="mt-8">
      <div className="h-px w-full my-4" style={{ background: 'linear-gradient(90deg, transparent, #a07840, transparent)' }} />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 relative">
        <h3 className="text-[clamp(0.9rem,1.8vw,1.15rem)] tracking-wider text-center" style={{
          fontFamily: "var(--vm-font-display)", color: '#5c3010',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}>📋 Guia de Referência Rápida — Party Completa</h3>
        <div className="flex gap-2 sm:absolute sm:right-0">
          <button
            type="button"
            onClick={() => downloadPartyDoc(summaries ?? [], sheets ?? [])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.72rem] font-bold tracking-wider transition-transform hover:scale-105"
            style={{
              fontFamily: "var(--vm-font-heading)",
              background: '#5c3010',
              color: '#f0ddb0',
              border: '1px solid #a07840',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="Baixar documento Word (.docx) com todas as fichas ativas"
          >
            <FileText size={14} /> Baixar DOCX
          </button>
          <button
            type="button"
            onClick={() => downloadPartyCsv(summaries ?? [], sheets ?? [])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.72rem] font-bold tracking-wider transition-transform hover:scale-105"
            style={{
              fontFamily: "var(--vm-font-heading)",
              background: '#5c3010',
              color: '#f0ddb0',
              border: '1px solid #a07840',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="Baixar planilha CSV com todas as fichas"
          >
            <Download size={14} /> Baixar CSV
          </button>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {partyEntries.map((char) => (
          <AccordionItem key={char.id} value={char.id} className="border rounded overflow-hidden" style={{ borderColor: '#a07840', background: 'rgba(240,221,176,0.5)' }}>
            <AccordionTrigger className="px-4 py-3 hover:no-underline" style={{ background: 'linear-gradient(135deg, rgba(160,120,64,0.15), rgba(139,100,30,0.08))' }}>
              <div className="flex items-center gap-3 flex-1 text-left flex-wrap">
                <span className="text-lg font-bold" style={{ fontFamily: "var(--vm-font-heading)", color: '#33303f' }}>{char.name}</span>
                <span className="text-[0.65rem] italic" style={{ color: '#6a6458' }}>{char.player}</span>
                <span className="text-[0.6rem] px-2 py-0.5 rounded-full ml-auto mr-2" style={{
                  fontFamily: "var(--vm-font-heading)", background: 'rgba(139,26,26,0.15)', border: '1px solid rgba(139,26,26,0.3)', color: '#9c2620',
                }}>{char.race} · {char.classInfo} Nv.{char.level}</span>
                <span className="text-[0.7rem] font-bold px-1.5 py-0.5 rounded" style={{ background: '#9c2620', color: '#f0ddb0' }}>CA {char.ac}</span>
                <span className="text-[0.7rem] font-bold px-1.5 py-0.5 rounded" style={{ background: '#5c3010', color: '#f0ddb0' }}>PV {char.hp}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <CharAccordionContent char={char} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
