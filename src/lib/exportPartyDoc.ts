import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  LevelFormat,
  PageBreak,
} from 'docx';
import type { CharacterSummary, CharacterSheet } from '@/data/characters';
import { buildCharacterContext, type PartyEntry, type PartyTrait } from '@/lib/characterContext';

const DEAD_IDS = new Set(['char-theron']);

const COLOR_HEADING = '3D1A05';
const COLOR_SUBHEAD = '5C3010';
const COLOR_ACCENT = '7A4A10';
const COLOR_MUTED = '666666';
const COLOR_BORDER = 'C9A060';

function safeName(s: string): string {
  return s.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').replace(/\s+/g, '_');
}

function p(text: string, opts: { italic?: boolean; bold?: boolean; color?: string; size?: number; spacingAfter?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: opts.spacingAfter ?? 80 },
    children: [
      new TextRun({
        text,
        italics: opts.italic,
        bold: opts.bold,
        color: opts.color,
        size: opts.size,
      }),
    ],
  });
}

function richP(runs: TextRun[], spacingAfter = 80): Paragraph {
  return new Paragraph({ spacing: { after: spacingAfter }, children: runs });
}

function h1(text: string, pageBreakBefore = false): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text, bold: true, color: COLOR_HEADING, size: 40 })],
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, color: COLOR_SUBHEAD, size: 26 })],
  });
}

function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, bold: true, italics: true, color: COLOR_ACCENT, size: 22 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text })],
  });
}

function bulletRich(runs: TextRun[]): Paragraph {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 60 },
    children: runs,
  });
}

function traitBullets(traits: PartyTrait[]): Paragraph[] {
  return traits.map(t =>
    bulletRich([
      new TextRun({ text: `${t.name}: `, bold: true }),
      new TextRun({ text: t.desc }),
    ]),
  );
}

function attributesTable(attrs: { value: string; label: string }[]): Table {
  const cellBorder = { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
  const colCount = attrs.length || 1;
  const tableWidth = 9000;
  const colWidth = Math.floor(tableWidth / colCount);

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: Array(colCount).fill(colWidth),
    rows: [
      new TableRow({
        children: attrs.map(a => new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          shading: { fill: 'F5EEDC', type: ShadingType.CLEAR, color: 'auto' },
          margins: { top: 80, bottom: 40, left: 80, right: 80 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: a.label, bold: true, color: COLOR_SUBHEAD, size: 18 })],
          })],
        })),
      }),
      new TableRow({
        children: attrs.map(a => new TableCell({
          borders,
          width: { size: colWidth, type: WidthType.DXA },
          margins: { top: 40, bottom: 80, left: 80, right: 80 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({ text: a.value, size: 22 })],
          })],
        })),
      }),
    ],
  });
}

function entryParagraphs(e: PartyEntry, isFirst: boolean): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];

  out.push(h1(e.name, !isFirst));
  out.push(p(`${e.player} — ${e.race} · ${e.classInfo} · Nível ${e.level}`, { italic: true, color: COLOR_MUTED, size: 20 }));
  if (e.subtitle) out.push(p(e.subtitle, { italic: true, color: COLOR_MUTED }));
  if (e.quote) out.push(p(`"${e.quote}"`, { italic: true, color: COLOR_MUTED, spacingAfter: 160 }));

  // Combate
  const combatBits: { label: string; value: string }[] = [];
  combatBits.push({ label: 'CA', value: `${e.ac}${e.acSub ? ` (${e.acSub})` : ''}` });
  combatBits.push({ label: 'PV', value: e.hp });
  if (e.initiative) combatBits.push({ label: 'Iniciativa', value: e.initiative });
  if (e.attackBonus) combatBits.push({ label: 'Ataque', value: `${e.attackBonus}${e.attackDamage ? ` (${e.attackDamage})` : ''}` });
  if (e.spellAttack) combatBits.push({ label: 'Atq Mágico', value: e.spellAttack });
  if (e.spellDC) combatBits.push({ label: 'CD', value: e.spellDC });
  if (combatBits.length) {
    out.push(h2('Combate'));
    const runs: TextRun[] = [];
    combatBits.forEach((b, i) => {
      if (i > 0) runs.push(new TextRun({ text: '   ·   ' }));
      runs.push(new TextRun({ text: `${b.label} ` }));
      runs.push(new TextRun({ text: b.value, bold: true }));
    });
    out.push(richP(runs));
  }

  if (e.attributes?.length) {
    out.push(h2('Atributos'));
    out.push(attributesTable(e.attributes));
    out.push(p('', { spacingAfter: 0 }));
  }

  if (e.skills) {
    out.push(h2('Perícias'));
    out.push(p(e.skills));
  }

  if (e.tags?.length) {
    out.push(h2('Tags'));
    out.push(p(e.tags.join(' · ')));
  }

  if (e.resources?.length || e.resourceSummary) {
    out.push(h2('Recursos'));
    if (e.resourceSummary) out.push(p(e.resourceSummary, { italic: true, color: COLOR_MUTED }));
    if (e.resources?.length) {
      for (const r of e.resources) {
        out.push(bulletRich([
          new TextRun({ text: `${r.label}: `, bold: true }),
          new TextRun({ text: `${r.uses} (${r.refresh})` }),
        ]));
      }
    }
  }

  if (e.highlightedAbilities.length) {
    out.push(h2('Habilidades em Destaque'));
    out.push(...traitBullets(e.highlightedAbilities));
  }

  for (const pt of e.panelTraits) {
    if (!pt.traits.length) continue;
    out.push(h2(pt.panelTitle));
    out.push(...traitBullets(pt.traits));
  }

  for (const ab of e.attributeBlocks) {
    if (!ab.rows.length) continue;
    out.push(h2(ab.panelTitle));
    for (const r of ab.rows) {
      out.push(bulletRich([
        new TextRun({ text: `${r.name}: `, bold: true }),
        new TextRun({ text: `${r.value} (${r.mod})` }),
      ]));
    }
  }

  for (const tbl of e.tableEntries) {
    if (!tbl.rows.length) continue;
    out.push(h2(tbl.panelTitle));
    for (const r of tbl.rows) {
      out.push(bulletRich([
        new TextRun({ text: `${r.label}: `, bold: true }),
        new TextRun({ text: r.value }),
      ]));
    }
  }

  for (const ss of e.spellSections) {
    const hasContent = ss.sections.some(s => (s.spells?.length || s.traits?.length));
    if (!hasContent) continue;
    out.push(h2(ss.panelTitle));
    for (const sec of ss.sections) {
      const hasSec = (sec.spells?.length || sec.traits?.length);
      if (!hasSec) continue;
      out.push(h3(sec.label));
      if (sec.spells?.length) out.push(p(sec.spells.join(' · ')));
      if (sec.traits?.length) out.push(...traitBullets(sec.traits));
    }
  }

  const allMagic = [e.magicItem, ...(e.magicItems ?? [])].filter(Boolean) as NonNullable<typeof e.magicItem>[];
  for (const mi of allMagic) {
    out.push(h2('Item Mágico'));
    out.push(richP([
      new TextRun({ text: mi.title, bold: true }),
      ...(mi.rarity ? [new TextRun({ text: ` (${mi.rarity})`, italics: true })] : []),
    ]));
    if (mi.description) out.push(p(mi.description));
    if (mi.passive) out.push(richP([new TextRun({ text: 'Passivo: ', bold: true }), new TextRun({ text: mi.passive })]));
    if (mi.charges) out.push(richP([new TextRun({ text: 'Cargas: ', bold: true }), new TextRun({ text: mi.charges })]));
    if (mi.abilities?.length) out.push(...traitBullets(mi.abilities));
    if (mi.badges?.length) out.push(p(mi.badges.join(' · '), { italic: true, color: COLOR_MUTED }));
  }

  return out;
}

function buildDocument(entries: PartyEntry[]): Document {
  const children: (Paragraph | Table)[] = [];
  entries.forEach((e, i) => {
    children.push(...entryParagraphs(e, i === 0));
  });

  return new Document({
    creator: 'Velmoor DM Guide',
    title: 'Fichas de Personagem',
    styles: {
      default: {
        document: { run: { font: 'Georgia', size: 22 } },
      },
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children,
      },
    ],
  });
}

async function triggerDownload(doc: Document, filename: string) {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadCharacterDoc(summary: CharacterSummary, sheet?: CharacterSheet) {
  const { partyEntries } = buildCharacterContext([summary], sheet ? [sheet] : []);
  const entry = partyEntries[0];
  if (!entry) return;
  const doc = buildDocument([entry]);
  await triggerDownload(doc, `Ficha_${safeName(entry.name)}.docx`);
}

export async function downloadPartyDoc(summaries: CharacterSummary[], sheets: CharacterSheet[]) {
  const active = summaries.filter(s => !DEAD_IDS.has(s.id));
  const { partyEntries } = buildCharacterContext(active, sheets);
  if (!partyEntries.length) return;
  const doc = buildDocument(partyEntries);
  await triggerDownload(doc, 'Grupo_Velmoor.docx');
}
