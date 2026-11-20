import { describe, expect, it } from 'vitest';
import app from '../index';

describe('worker health endpoint', () => {
  it('returns a healthy response', async () => {
    const response = await app.request('http://localhost/health');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, service: 'lastarc-api' });
  });
});
