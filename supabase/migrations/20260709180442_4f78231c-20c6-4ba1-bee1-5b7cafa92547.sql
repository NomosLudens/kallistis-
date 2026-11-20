UPDATE public.voz_config
SET model = 'gemini-3.1-flash-live-preview', updated_at = now()
WHERE id = 1 AND model = 'gemini-3.5-live-translate-preview';