CREATE TABLE public.tecnologia_chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT 'Nova Solicitação',
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tecnologia_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all tecnologia_chat_sessions"
ON public.tecnologia_chat_sessions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE TABLE public.tecnologia_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  pending_patch jsonb,
  applied_override_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tecnologia_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public all tecnologia_chat_messages"
ON public.tecnologia_chat_messages
FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_tecnologia_chat_messages_session ON public.tecnologia_chat_messages(session_id, created_at);