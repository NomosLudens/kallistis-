CREATE TABLE IF NOT EXISTS public.voz_config (
  id int PRIMARY KEY DEFAULT 1,
  enabled boolean NOT NULL DEFAULT false,
  model text NOT NULL DEFAULT 'gemini-3.5-live-translate-preview',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voz_config_single_row CHECK (id = 1)
);

INSERT INTO public.voz_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.voz_config TO anon, authenticated;
GRANT UPDATE ON public.voz_config TO authenticated;
GRANT ALL ON public.voz_config TO service_role;

ALTER TABLE public.voz_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read voz_config" ON public.voz_config
  FOR SELECT USING (true);

CREATE POLICY "admins update voz_config" ON public.voz_config
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.email = (auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.email = (auth.jwt() ->> 'email')));