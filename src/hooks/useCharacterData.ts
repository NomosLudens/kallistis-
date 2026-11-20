import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  characterSummaries as baseSummaries,
  characterSheets as baseSheets,
  type CharacterSummary,
  type CharacterSheet,
} from '@/data/characters';
import { mergeCharacterData, type CharacterOverride } from '@/lib/mergeOverrides';

interface UseCharacterDataResult {
  summaries: CharacterSummary[];
  sheets: CharacterSheet[];
  overrides: CharacterOverride[];
  loading: boolean;
  reload: () => Promise<void>;
}

/**
 * Loads persisted character_overrides from the backend and merges them on top
 * of the static characterSummaries / characterSheets, plus any approved
 * AI-created characters from `created_characters` (with published_summary/sheet).
 *
 * Components that need to display always-up-to-date character info should
 * consume `summaries` / `sheets` from this hook instead of the static arrays.
 */
export function useCharacterData(): UseCharacterDataResult {
  const [overrides, setOverrides] = useState<CharacterOverride[]>([]);
  const [publishedSummaries, setPublishedSummaries] = useState<CharacterSummary[]>([]);
  const [publishedSheets, setPublishedSheets] = useState<CharacterSheet[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, pubRes] = await Promise.all([
        supabase
          .from('character_overrides')
          .select('*')
          .order('applied_at', { ascending: true }),
        supabase
          .from('created_characters')
          .select('published_summary, published_sheet, published_character_id, approved_at')
          .eq('status', 'approved')
          .not('published_summary', 'is', null)
          .not('published_sheet', 'is', null)
          .order('approved_at', { ascending: true }),
      ]);
      if (ovRes.error) throw ovRes.error;
      setOverrides((ovRes.data || []) as unknown as CharacterOverride[]);

      if (pubRes.error) {
        console.error('Failed to load published characters', pubRes.error);
        setPublishedSummaries([]);
        setPublishedSheets([]);
      } else {
        const pubs = pubRes.data || [];
        setPublishedSummaries(
          pubs
            .map((p: any) => p.published_summary as CharacterSummary)
            .filter((s): s is CharacterSummary => !!s && !!s.id),
        );
        setPublishedSheets(
          pubs
            .map((p: any) => p.published_sheet as CharacterSheet)
            .filter((s): s is CharacterSheet => !!s && !!s.id),
        );
      }
    } catch (e) {
      console.error('Failed to load character data:', e);
      setOverrides([]);
      setPublishedSummaries([]);
      setPublishedSheets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const merged = useMemo(() => {
    const allSummaries = [...baseSummaries, ...publishedSummaries];
    const allSheets = [...baseSheets, ...publishedSheets];
    return mergeCharacterData(allSummaries, allSheets, overrides);
  }, [overrides, publishedSummaries, publishedSheets]);

  return {
    summaries: merged.summaries,
    sheets: merged.sheets,
    overrides,
    loading,
    reload,
  };
}
