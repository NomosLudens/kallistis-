-- Tabela de requests de level up
CREATE TABLE public.level_up_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT NOT NULL,
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'enabled',
  enabled_by_email TEXT,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_level_up_requests_character ON public.level_up_requests(character_id);
CREATE INDEX idx_level_up_requests_status ON public.level_up_requests(status);

ALTER TABLE public.level_up_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all level_up_requests"
ON public.level_up_requests FOR ALL
USING (true) WITH CHECK (true);

-- Mensagens do chat de level up
CREATE TABLE public.level_up_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.level_up_requests(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_level_up_chat_messages_request ON public.level_up_chat_messages(request_id);

ALTER TABLE public.level_up_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all level_up_chat_messages"
ON public.level_up_chat_messages FOR ALL
USING (true) WITH CHECK (true);

-- Fichas finais
CREATE TABLE public.level_up_sheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.level_up_requests(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  decisions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_level_up_sheets_request ON public.level_up_sheets(request_id);

ALTER TABLE public.level_up_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all level_up_sheets"
ON public.level_up_sheets FOR ALL
USING (true) WITH CHECK (true);