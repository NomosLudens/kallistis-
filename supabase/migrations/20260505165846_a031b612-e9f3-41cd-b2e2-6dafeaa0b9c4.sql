CREATE TABLE public.journal_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read journal_pages" ON public.journal_pages FOR SELECT USING (true);
CREATE POLICY "Public insert journal_pages" ON public.journal_pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete journal_pages" ON public.journal_pages FOR DELETE USING (true);

CREATE INDEX idx_journal_pages_order ON public.journal_pages (position, created_at);