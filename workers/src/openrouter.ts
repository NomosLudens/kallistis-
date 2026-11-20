export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(
  messages: OpenRouterMessage[],
  apiKey: string,
  model = 'anthropic/claude-3.5-sonnet',
  baseUrl = 'https://openrouter.ai/api/v1',
) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lastarc.pages.dev',
      'X-Title': 'Last Arc Companion',
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) throw new Error(`OpenRouter request failed: ${res.status}`);
  return res.json();
}
