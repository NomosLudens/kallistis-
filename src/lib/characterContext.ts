import type { CharacterSummary, CharacterSheet, SheetPanel, SpellSection } from '@/data/characters';

export interface PartySpell { name: string; desc: string }
export interface PartyTrait { name: string; desc: string }

export interface PartyEntry {
  id: string;
  name: string;
  player: string;
  race: string;
  classInfo: string;        // cleaned (no race prefix, no "Nv.X" suffix)
  level: number;
  ac: string;
  acSub?: string;
  hp: string;
  initiative?: string;
  combatStats: { value: string; label: string }[]; // raw stats from summary
  attributes: { value: string; label: string }[];
  skills?: string;
  tags: string[];
  image?: string;

  // Combat highlight
  attackBonus?: string;
  attackDamage?: string;
  spellAttack?: string;
  spellDC?: string;
  resources?: { label: string; uses: string; refresh: string }[];

  // Abilities/spells aggregated from sheet panels
  highlightedAbilities: PartyTrait[];     // from sheet.abilities.items
  resourceSummary?: string;
  panelTraits: { panelTitle: string; icon: string; traits: PartyTrait[] }[]; // raw traits per panel
  spellSections: { panelTitle: string; sections: SpellSection[] }[];
  tableEntries: { panelTitle: string; rows: { label: string; value: string }[] }[];
  attributeBlocks: { panelTitle: string; rows: { name: string; value: string; mod: string }[] }[];

  magicItem?: {
    title: string;
    rarity?: string;
    description?: string;
    passive?: string;
    charges?: string;
    abilities: PartyTrait[];
    badges?: string[];
  };
  magicItems?: {
    title: string;
    rarity?: string;
    description?: string;
    passive?: string;
    charges?: string;
    abilities: PartyTrait[];
    badges?: string[];
  }[];

  quote?: string;
  subtitle?: string;
}

export interface CharacterContext {
  partyEntries: PartyEntry[];
  aiContextText: string;
}

function parseLevelFromClassInfo(classInfo: string): number | null {
  const m = classInfo.match(/Nv\.?\s*(\d+)/i) ?? classInfo.match(/N[ií]vel\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function pickStat(stats: { value: string; label: string }[] | undefined, label: string): string | undefined {
  if (!Array.isArray(stats)) return undefined;
  const found = stats.find(s => s.label.toLowerCase().includes(label.toLowerCase()));
  return found?.value;
}

function cleanClassInfo(classInfo: string, race: string): string {
  return classInfo
    .replace(new RegExp(`^${race}\\s*·\\s*`, 'i'), '')
    .replace(/\s*Nv\.?\s*\d+\s*/i, '')
    .trim();
}

function panelsToEntry(
  entry: PartyEntry,
  panels: SheetPanel[] | undefined,
) {
  if (!panels) return;
  for (const p of panels) {
    const c = p.content || {};
    if (c.traits && c.traits.length) {
      entry.panelTraits.push({ panelTitle: p.title, icon: p.icon, traits: c.traits });
    }
    if (c.spellSections && c.spellSections.length) {
      entry.spellSections.push({ panelTitle: p.title, sections: c.spellSections });
    }
    if (c.table && c.table.length) {
      entry.tableEntries.push({ panelTitle: p.title, rows: c.table });
    }
    if (c.attributes && c.attributes.length) {
      entry.attributeBlocks.push({
        panelTitle: p.title,
        rows: c.attributes.map(a => ({ name: a.name, value: a.value, mod: a.mod })),
      });
    }
  }
}

export function buildPartyEntry(summary: CharacterSummary, sheet?: CharacterSheet): PartyEntry {
  const level = parseLevelFromClassInfo(summary.classInfo) ?? 1;
  const ac = pickStat(summary.combatStats, 'CA') ?? sheet?.combatHighlight?.ac ?? '—';
  const hp = pickStat(summary.combatStats, 'PV') ?? sheet?.combatHighlight?.hp ?? '—';
  const initiative = pickStat(summary.combatStats, 'Iniciativa');
  const ch = sheet?.combatHighlight;

  const entry: PartyEntry = {
    id: summary.id,
    name: summary.name,
    player: summary.player,
    race: summary.race,
    classInfo: cleanClassInfo(summary.classInfo, summary.race),
    level,
    ac,
    acSub: ch?.acSub,
    hp,
    initiative,
    combatStats: summary.combatStats,
    attributes: summary.attributes,
    skills: summary.skills,
    tags: summary.tags ?? [],
    image: summary.image,
    attackBonus: ch?.attackBonus,
    attackDamage: ch?.attackDamage,
    spellAttack: ch?.spellAttack,
    spellDC: ch?.spellDC,
    resources: ch?.resources,
    highlightedAbilities: (sheet?.abilities?.items || []).map(i => ({ name: i.name, desc: i.desc })),
    resourceSummary: sheet?.abilities?.resourceSummary,
    panelTraits: [],
    spellSections: [],
    tableEntries: [],
    attributeBlocks: [],
    quote: sheet?.quote,
    subtitle: sheet?.subtitle,
  };

  panelsToEntry(entry, sheet?.leftPanels);
  panelsToEntry(entry, sheet?.rightPanels);

  if (sheet?.magicItem) {
    entry.magicItem = {
      title: sheet.magicItem.title,
      rarity: sheet.magicItem.rarity,
      description: sheet.magicItem.description,
      passive: sheet.magicItem.passive,
      charges: sheet.magicItem.charges,
      abilities: sheet.magicItem.abilities || [],
      badges: sheet.magicItem.badges,
    };
  }
  if (sheet?.magicItems?.length) {
    entry.magicItems = sheet.magicItems.map(mi => ({
      title: mi.title,
      rarity: mi.rarity,
      description: mi.description,
      passive: mi.passive,
      charges: mi.charges,
      abilities: mi.abilities || [],
      badges: mi.badges,
    }));
  }

  return entry;
}

function entryToMarkdown(e: PartyEntry): string {
  const lines: string[] = [];
  const dead = e.id === 'char-theron' ? ' ☠ MORTO' : '';
  lines.push(`### ${e.name} (${e.player}) — ${e.race} · ${e.classInfo} Nv.${e.level}${dead}`);
  if (e.subtitle) lines.push(`_${e.subtitle}_`);

  const stats = [
    `CA ${e.ac}${e.acSub ? ` (${e.acSub})` : ''}`,
    `PV ${e.hp}`,
    e.initiative ? `Iniciativa ${e.initiative}` : null,
    e.attackBonus ? `Ataque ${e.attackBonus}${e.attackDamage ? ` (${e.attackDamage})` : ''}` : null,
    e.spellAttack ? `Atq Mágico ${e.spellAttack}` : null,
    e.spellDC ? `CD ${e.spellDC}` : null,
  ].filter(Boolean).join(' | ');
  if (stats) lines.push(stats);

  if (e.attributes?.length) {
    lines.push(`Atributos: ${e.attributes.map(a => `${a.label} ${a.value}`).join(', ')}`);
  }
  if (e.skills) lines.push(`Perícias: ${e.skills}`);
  if (e.tags?.length) lines.push(`Tags: ${e.tags.join(' · ')}`);

  if (e.resourceSummary) lines.push(`Recursos: ${e.resourceSummary}`);
  if (e.resources?.length) {
    lines.push(`Recursos: ${e.resources.map(r => `${r.label} ${r.uses}/${r.refresh}`).join(' · ')}`);
  }

  if (e.highlightedAbilities.length) {
    lines.push(`**Habilidades destacadas:**`);
    for (const a of e.highlightedAbilities) lines.push(`- ${a.name}: ${a.desc}`);
  }

  for (const p of e.panelTraits) {
    if (!p.traits.length) continue;
    lines.push(`**${p.panelTitle}:**`);
    for (const t of p.traits) lines.push(`- ${t.name}: ${t.desc}`);
  }

  for (const tbl of e.tableEntries) {
    if (!tbl.rows.length) continue;
    lines.push(`**${tbl.panelTitle}:** ${tbl.rows.map(r => `${r.label}: ${r.value}`).join(' · ')}`);
  }

  for (const ab of e.attributeBlocks) {
    if (!ab.rows.length) continue;
    lines.push(`**${ab.panelTitle}:** ${ab.rows.map(r => `${r.name} ${r.value} (${r.mod})`).join(' · ')}`);
  }

  for (const ss of e.spellSections) {
    for (const sec of ss.sections) {
      const head = `**${ss.panelTitle} — ${sec.label}:**`;
      if (sec.spells?.length) lines.push(`${head} ${sec.spells.join(' · ')}`);
      if (sec.traits?.length) {
        lines.push(head);
        for (const t of sec.traits) lines.push(`- ${t.name}: ${t.desc}`);
      }
    }
  }

  const allMagic = [e.magicItem, ...(e.magicItems ?? [])].filter(Boolean) as NonNullable<PartyEntry['magicItem']>[];
  for (const mi of allMagic) {
    lines.push(`**Item Mágico — ${mi.title}${mi.rarity ? ` (${mi.rarity})` : ''}:**`);
    if (mi.description) lines.push(mi.description);
    if (mi.passive) lines.push(`Passivo: ${mi.passive}`);
    if (mi.charges) lines.push(`Cargas: ${mi.charges}`);
    for (const a of mi.abilities) lines.push(`- ${a.name}: ${a.desc}`);
  }

  return lines.join('\n');
}

export function buildCharacterContext(
  summaries: CharacterSummary[],
  sheets: CharacterSheet[],
): CharacterContext {
  const sheetById = new Map(sheets.map(s => [s.id, s]));
  const partyEntries = summaries.map(s => buildPartyEntry(s, sheetById.get(s.id)));

  const aiContextText = [
    '## CONTEXTO DINÂMICO — Fichas atualizadas dos personagens',
    '> Esta seção é gerada automaticamente a partir do estado atual das fichas no app (incluindo level-ups, edições via Tecnologia.IA e personagens novos publicados). **Considere-a a fonte da verdade** sobre os PJs. Se houver conflito com qualquer informação anterior, esta prevalece.',
    '',
    ...partyEntries.map(entryToMarkdown),
  ].join('\n\n');

  return { partyEntries, aiContextText };
}
