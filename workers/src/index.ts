import { Hono } from 'hono';
import { chatCompletion, type OpenRouterMessage } from './openrouter';

type Env = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_BASE_URL?: string;
  LASTARC_CACHE?: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true, service: 'lastarc-api' }));

app.post('/ai/chat', async (c) => {
  if (!c.env.OPENROUTER_API_KEY) return c.json({ error: 'AI is not configured' }, 503);
  const body = await c.req.json<{ messages?: OpenRouterMessage[]; model?: string }>();
  if (!body.messages?.length) return c.json({ error: 'messages is required' }, 400);

  try {
    const result = await chatCompletion(body.messages, c.env.OPENROUTER_API_KEY, body.model, c.env.OPENROUTER_BASE_URL);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'AI request failed' }, 502);
  }
});

export default app;
