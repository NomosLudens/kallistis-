/**
 * Apply declarative JSON patches to character summaries and sheets.
 *
 * Patch operations supported (top-level keys in the patch object):
 *   - "set": { fieldPath: value }                       -> overwrites a field (dot-paths supported)
 *   - "<arrayPath>.add":     [items]                    -> append items to array
 *   - "<arrayPath>.remove":  [items|matchStrings]       -> remove items (string match by substring on .name or full equality)
 *   - "<arrayPath>.replace": [{ match: "...", ... }]    -> replace matching items by substring on .name (or .label)
 *
 * For sheets, an extra "panels" key may target left/right panels by title:
 *   { panels: [
 *       { side: "left"|"right", title: "PERÍCIAS",
 *         newTitle?: "...",
 *         "table.add"|"table.replace"|"table.remove": [...],
 *         "traits.add"|"traits.replace"|"traits.remove": [...],
 *         "attributes.add"|"attributes.replace": [...],
 *         "spellSections.replace": [...]   // FULL replace of the spellSections array
 *       }
 *   ]}
 *
 * The functions are intentionally tolerant: unknown ops are skipped silently.
 */

import type { CharacterSummary, CharacterSheet, SheetPanel, AbilityHighlight } from '@/data/characters';

type AnyObj = Record<string, any>;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function getByPath(obj: AnyObj, path: string): any {
  return path.split('.').reduce<any>((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function setByPath(obj: AnyObj, path: string, value: any) {
  const parts = path.split('.');
  const last = parts.pop()!;
  let cur: AnyObj = obj;
  for (const p of parts) {
    if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[last] = value;
}

function matchesByName(item: any, match: string): boolean {
  if (typeof item === 'string') return item.includes(match);
  if (item && typeof item === 'object') {
    const key = item.name ?? item.label ?? item.title ?? '';
    return typeof key === 'string' && key.toLowerCase().includes(match.toLowerCase());
  }
  return false;
}

/**
 * Strict-replace fields where adding new entries would visually break layouts
 * (e.g. summary combatStats / attributes are rendered as fixed-size grids).
 */
const STRICT_REPLACE_PATHS = new Set(['combatStats', 'attributes']);

export interface PatchWarning {
  path: string;
  op: 'replace' | 'remove';
  match: string;
  reason: string;
}

function applyArrayOps(target: AnyObj, basePath: string, patch: AnyObj, warnings: PatchWarning[], pathPrefix = '') {
  for (const op of ['add', 'remove', 'replace'] as const) {
    const key = `${basePath}.${op}`;
    if (!(key in patch)) continue;
    const payload = patch[key];
    if (!Array.isArray(payload)) continue;

    // Special-case: full-array replace when payload items have no "match" key.
    // Lets patches do `tags.replace: ["a","b"]` to overwrite the whole array.
    if (op === 'replace') {
      const allWithoutMatch = payload.every(it => !(it && typeof it === 'object' && 'match' in it));
      if (allWithoutMatch && payload.every(it => typeof it === 'string')) {
        // Overwrite the array with the provided strings
        setByPath(target, basePath, payload.map(v => clone(v)));
        continue;
      }
      // Full-array overwrite for object arrays explicitly tagged with __full: true on the first item,
      // OR for known whole-array fields (e.g. spellSections) where partial match-by-name doesn't make sense.
      const isFullArrayField = basePath === 'spellSections';
      if (allWithoutMatch && isFullArrayField) {
        setByPath(target, basePath, payload.map(v => clone(v)));
        continue;
      }
    }

    let arr = getByPath(target, basePath);
    if (!Array.isArray(arr)) {
      // initialize empty array for add/remove/replace if path was missing
      arr = [];
      setByPath(target, basePath, arr);
    }

    const fullPath = pathPrefix ? `${pathPrefix}.${basePath}` : basePath;

    if (op === 'add') {
      for (const it of payload) arr.push(clone(it));
    } else if (op === 'remove') {
      for (const m of payload) {
        const matchStr = typeof m === 'string' ? m : (m?.match ?? m?.name ?? '');
        if (!matchStr) continue;
        const before = arr.length;
        for (let i = arr.length - 1; i >= 0; i--) {
          if (matchesByName(arr[i], matchStr)) arr.splice(i, 1);
        }
        if (arr.length === before) {
          warnings.push({ path: fullPath, op: 'remove', match: matchStr, reason: 'no item matched' });
        }
      }
    } else if (op === 'replace') {
      // Strict only for fixed-size grids (summary combatStats / attributes, and panel attributes
      // in "ATRIBUTOS & COMBATE" which is a fixed mod/value grid). For panel traits + table we
      // append-on-miss with a warning so the AI's `.replace` for a new item doesn't get lost.
      const strict =
        STRICT_REPLACE_PATHS.has(basePath) &&
        (pathPrefix === 'summary' || basePath === 'attributes');
      for (const it of payload) {
        // Reject use of `label:` as identifier — only `match` is the contract.
        if (it && typeof it === 'object' && !('match' in it) && ('label' in it || 'name' in it)) {
          const probableId = it.label ?? it.name ?? '';
          warnings.push({
            path: fullPath,
            op: 'replace',
            match: String(probableId),
            reason: 'item used "label"/"name" as identifier instead of "match" — patch ignored for this item',
          });
          continue;
        }
        const matchStr: string = it?.match ?? '';
        if (!matchStr) continue;
        const idx = arr.findIndex(a => matchesByName(a, matchStr));
        const { match, ...rest } = it;
        if (idx >= 0) {
          if (typeof arr[idx] === 'string') {
            arr[idx] = rest.value ?? rest.name ?? rest.label ?? arr[idx];
          } else {
            arr[idx] = { ...arr[idx], ...rest };
          }
        } else if (!strict) {
          // not found -> append with warning so the admin notices the AI used replace
          // for a non-existent item (probably meant `.add`).
          arr.push(clone(rest));
          warnings.push({
            path: fullPath,
            op: 'replace',
            match: matchStr,
            reason: `no item matched — appended as new (AI should have used "${basePath}.add")`,
          });
        } else {
          warnings.push({
            path: fullPath,
            op: 'replace',
            match: matchStr,
            reason: 'no item matched (strict path — append blocked to preserve layout)',
          });
          console.warn(
            `[mergeOverrides] strict replace miss on "${fullPath}" for match "${matchStr}" — ignored`,
          );
        }
      }
    }
  }
}

export function applySummaryPatchWithWarnings(
  base: CharacterSummary,
  patch: AnyObj | null | undefined,
): { result: CharacterSummary; warnings: PatchWarning[] } {
  const warnings: PatchWarning[] = [];
  if (!patch || typeof patch !== 'object') return { result: base, warnings };
  const out = clone(base);

  if (patch.set && typeof patch.set === 'object') {
    for (const [k, v] of Object.entries(patch.set)) setByPath(out, k, v);
  }
  for (const arrField of ['combatStats', 'attributes', 'tags']) {
    applyArrayOps(out, arrField, patch, warnings, 'summary');
  }
  return { result: out, warnings };
}

export function applySummaryPatch(base: CharacterSummary, patch: AnyObj | null | undefined): CharacterSummary {
  return applySummaryPatchWithWarnings(base, patch).result;
}

function patchPanel(
  panel: SheetPanel,
  panelPatch: AnyObj,
  warnings: PatchWarning[],
  panelIdx: number,
): SheetPanel {
  const out = clone(panel);
  if (typeof panelPatch.newTitle === 'string') out.title = panelPatch.newTitle;
  if (typeof panelPatch.icon === 'string') out.icon = panelPatch.icon;

  out.content = out.content || {};
  for (const arrField of ['table', 'traits', 'attributes', 'spellTags', 'spellSections']) {
    if (!Array.isArray((out.content as AnyObj)[arrField])) {
      // initialize only if a patch op for this field exists
      if (
        `${arrField}.add` in panelPatch ||
        `${arrField}.replace` in panelPatch ||
        `${arrField}.remove` in panelPatch
      ) {
        (out.content as AnyObj)[arrField] = [];
      }
    }
    applyArrayOps(out.content as AnyObj, arrField, panelPatch, warnings, `panels[${panelIdx}:${out.title}]`);
  }
  return out;
}

export function applySheetPatchWithWarnings(
  base: CharacterSheet,
  patch: AnyObj | null | undefined,
): { result: CharacterSheet; warnings: PatchWarning[] } {
  const warnings: PatchWarning[] = [];
  if (!patch || typeof patch !== 'object') return { result: base, warnings };
  const out = clone(base);

  if (patch.set && typeof patch.set === 'object') {
    for (const [k, v] of Object.entries(patch.set)) setByPath(out, k, v);
  }

  // Panels
  if (Array.isArray(patch.panels)) {
    for (const pp of patch.panels) {
      const side: 'left' | 'right' = pp.side === 'right' ? 'right' : 'left';
      const list = side === 'right' ? out.rightPanels : out.leftPanels;
      const titleMatch: string = pp.title ?? '';
      const idx = list.findIndex(p => p.title.toLowerCase().includes(titleMatch.toLowerCase()));
      if (idx >= 0) {
        list[idx] = patchPanel(list[idx], pp, warnings, idx);
      } else if (titleMatch) {
        // Create a brand new panel
        list.push(patchPanel({ icon: pp.icon ?? '✦', title: pp.newTitle ?? titleMatch, content: {} }, pp, warnings, list.length));
      } else {
        warnings.push({ path: 'panels', op: 'replace', match: '(empty title)', reason: 'panel patch missing title' });
      }
    }
  }

  // abilities.* — accept BOTH flat keys ("abilities.title", "abilities.items.add", ...)
  // AND a nested object ("abilities": { title, resourceSummary, "items.add": [...] }).
  // The nested form merged silently before, breaking patches like Aerith Nv5.
  const flat: AnyObj = {
    'abilities.title': patch['abilities.title'],
    'abilities.resourceSummary': patch['abilities.resourceSummary'],
    'abilities.items.add': patch['abilities.items.add'],
    'abilities.items.remove': patch['abilities.items.remove'],
    'abilities.items.replace': patch['abilities.items.replace'],
  };
  const nested = patch.abilities && typeof patch.abilities === 'object' ? patch.abilities : null;
  if (nested) {
    if (typeof nested.title === 'string') flat['abilities.title'] = nested.title;
    if (typeof nested.resourceSummary === 'string') flat['abilities.resourceSummary'] = nested.resourceSummary;
    if (Array.isArray(nested['items.add'])) flat['abilities.items.add'] = nested['items.add'];
    if (Array.isArray(nested['items.remove'])) flat['abilities.items.remove'] = nested['items.remove'];
    if (Array.isArray(nested['items.replace'])) flat['abilities.items.replace'] = nested['items.replace'];
    if (Array.isArray(nested.items) && !flat['abilities.items.add']) flat['abilities.items.add'] = nested.items;
  }

  if (out.abilities) {
    if (typeof flat['abilities.resourceSummary'] === 'string') {
      out.abilities.resourceSummary = flat['abilities.resourceSummary'];
    }
    if (typeof flat['abilities.title'] === 'string') {
      out.abilities.title = flat['abilities.title'];
    }
    applyArrayOps(
      out.abilities as AnyObj,
      'items',
      {
        'items.add': flat['abilities.items.add'],
        'items.remove': flat['abilities.items.remove'],
        'items.replace': flat['abilities.items.replace'],
      },
      warnings,
      'abilities',
    );
  } else if (
    flat['abilities.items.add'] ||
    flat['abilities.resourceSummary'] ||
    flat['abilities.title']
  ) {
    out.abilities = {
      title: flat['abilities.title'] ?? `Resumo — ${out.name}`,
      resourceSummary: flat['abilities.resourceSummary'] ?? '',
      items: (flat['abilities.items.add'] as AbilityHighlight[]) ?? [],
    };
  }

  return { result: out, warnings };
}

export function applySheetPatch(base: CharacterSheet, patch: AnyObj | null | undefined): CharacterSheet {
  return applySheetPatchWithWarnings(base, patch).result;
}

export interface CharacterOverride {
  id: string;
  character_id: string;
  request_id: string | null;
  summary_patch: AnyObj;
  sheet_patch: AnyObj;
  applied_at: string;
  applied_by_email: string | null;
}

/**
 * Merge a full list of overrides (oldest first) into static character data.
 */
export function mergeCharacterData(
  baseSummaries: CharacterSummary[],
  baseSheets: CharacterSheet[],
  overrides: CharacterOverride[],
) {
  // Sort ascending by applied_at so newer overrides apply on top
  const sorted = [...overrides].sort(
    (a, b) => new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime(),
  );

  const summaryById = new Map<string, CharacterSummary>(baseSummaries.map(s => [s.id, clone(s)]));
  const sheetById = new Map<string, CharacterSheet>(baseSheets.map(s => [s.id, clone(s)]));

  for (const ov of sorted) {
    const summary = summaryById.get(ov.character_id);
    if (summary) summaryById.set(ov.character_id, applySummaryPatch(summary, ov.summary_patch));
    const sheet = sheetById.get(ov.character_id);
    if (sheet) sheetById.set(ov.character_id, applySheetPatch(sheet, ov.sheet_patch));
  }

  return {
    summaries: baseSummaries.map(s => summaryById.get(s.id)!),
    sheets: baseSheets.map(s => sheetById.get(s.id)!),
  };
}
