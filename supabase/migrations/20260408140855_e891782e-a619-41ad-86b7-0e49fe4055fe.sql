-- Admin users whitelist
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read admin_users" ON public.admin_users FOR SELECT TO public USING (true);

-- Mag.IA chat tables
CREATE TABLE public.magia_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Novo Chat',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.magia_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all magia_chat_sessions" ON public.magia_chat_sessions FOR ALL TO public USING (true) WITH CHECK (true);

CREATE TABLE public.magia_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.magia_chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.magia_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public all magia_chat_messages" ON public.magia_chat_messages FOR ALL TO public USING (true) WITH CHECK (true);