import type { CharacterSummary, CharacterSheet } from '@/data/characters';
import { buildCharacterContext, type PartyEntry } from '@/lib/characterContext';

const COLUMNS = [
  'id', 'nome', 'jogador', 'raca', 'classe', 'nivel', 'subtitulo', 'quote',
  'CA', 'CA_extra', 'PV', 'iniciativa', 'prof',
  'ataque_fisico', 'dano_ataque', 'ataque_magico', 'CD_magia',
  'FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR',
  'pericias', 'tags',
  'recursos_resumo', 'recursos_combate',
  'habilidades_destaque',
  'paineis',
  'magias',
  'item_magico_titulo', 'item_magico_raridade', 'item_magico_descricao',
  'item_magico_passivo', 'item_magico_cargas', 'item_magico_habilidades', 'item_magico_badges',
] as const;

function clean(s: string | undefined): string {
  if (!s) return '';
  return s.replace(/\r?\n+/g, ' / ').replace(/\s+/g, ' ').trim();
}

function attr(e: PartyEntry, label: string): string {
  return e.attributes.find(a => a.label.toUpperCase() === label)?.value ?? '';
}

function combat(e: PartyEntry, label: string): string {
  return e.combatStats.find(s => s.label.toLowerCase().includes(label.toLowerCase()))?.value ?? '';
}

function entryToRow(e: PartyEntry): Record<string, string> {
  const traits = (arr: { name: string; desc: string }[]) =>
    arr.map(t => `${clean(t.name)}: ${clean(t.desc)}`).join(' | ');

  const paineis = [
    ...e.panelTraits.map(p => `${clean(p.panelTitle)} [${p.icon}]: ${traits(p.traits)}`),
    ...e.tableEntries.map(t => `${clean(t.panelTitle)}: ${t.rows.map(r => `${clean(r.label)}: ${clean(r.value)}`).join(' | ')}`),
    ...e.attributeBlocks.map(a => `${clean(a.panelTitle)}: ${a.rows.map(r => `${clean(r.name)} ${clean(r.value)} (${clean(r.mod)})`).join(' | ')}`),
  ].filter(Boolean).join(' ; ');

  const magias = e.spellSections.flatMap(ss =>
    ss.sections.map(sec => {
      const parts: string[] = [];
      if (sec.spells?.length) parts.push(sec.spells.map(clean).join(' · '));
      if (sec.traits?.length) parts.push(traits(sec.traits));
      return `${clean(ss.panelTitle)} — ${clean(sec.label)}: ${parts.join(' · ')}`;
    }),
  ).join(' ; ');

  return {
    id: e.id,
    nome: clean(e.name),
    jogador: clean(e.player),
    raca: clean(e.race),
    classe: clean(e.classInfo),
    nivel: String(e.level),
    subtitulo: clean(e.subtitle),
    quote: clean(e.quote),
    CA: clean(e.ac),
    CA_extra: clean(e.acSub),
    PV: clean(e.hp),
    iniciativa: clean(e.initiative),
    prof: combat(e, 'Prof'),
    ataque_fisico: clean(e.attackBonus),
    dano_ataque: clean(e.attackDamage),
    ataque_magico: clean(e.spellAttack),
    CD_magia: clean(e.spellDC),
    FOR: attr(e, 'FOR'),
    DES: attr(e, 'DES'),
    CON: attr(e, 'CON'),
    INT: attr(e, 'INT'),
    SAB: attr(e, 'SAB'),
    CAR: attr(e, 'CAR'),
    pericias: clean(e.skills),
    tags: e.tags.map(clean).join(' · '),
    recursos_resumo: clean(e.resourceSummary),
    recursos_combate: (e.resources ?? []).map(r => `${clean(r.label)} ${clean(r.uses)}/${clean(r.refresh)}`).join(' · '),
    habilidades_destaque: traits(e.highlightedAbilities),
    paineis,
    magias,
    item_magico_titulo: clean(e.magicItem?.title),
    item_magico_raridade: clean(e.magicItem?.rarity),
    item_magico_descricao: clean(e.magicItem?.description),
    item_magico_passivo: clean(e.magicItem?.passive),
    item_magico_cargas: clean(e.magicItem?.charges),
    item_magico_habilidades: e.magicItem ? traits(e.magicItem.abilities) : '',
    item_magico_badges: (e.magicItem?.badges ?? []).map(clean).join(' · '),
  };
}

function escapeCell(v: string): string {
  if (v === '') return '';
  if (/[",\n;]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function buildPartyCsv(summaries: CharacterSummary[], sheets: CharacterSheet[]): string {
  const { partyEntries } = buildCharacterContext(summaries, sheets);
  const rows = partyEntries.map(entryToRow);
  const lines = [
    COLUMNS.join(','),
    ...rows.map(r => COLUMNS.map(c => escapeCell(r[c] ?? '')).join(',')),
  ];
  return '\uFEFF' + lines.join('\n');
}

export function downloadPartyCsv(summaries: CharacterSummary[], sheets: CharacterSheet[]): void {
  const csv = buildPartyCsv(summaries, sheets);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `velmoor-party-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
