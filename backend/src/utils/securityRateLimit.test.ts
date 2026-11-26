import { describe, it, expect } from 'vitest';
import { handler as chatHandler } from '../netlify/functions/chat.js';

describe('Server-Side Security & Rate Limiting Verification', () => {
  it('enforces HTTP 429 Too Many Requests when rate limit threshold is exceeded', async () => {
    // Temporarily disable test mode bypass for rate limiter testing
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const event = {
        httpMethod: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.195' },
        body: JSON.stringify({
          message: 'Hello world',
        }),
      };

      let lastResponse: any;
      // Rapidly fire 35 requests from same IP (threshold is 30)
      for (let i = 0; i < 35; i++) {
        lastResponse = await chatHandler(event);
      }

      expect(lastResponse.statusCode).toBe(429);
      const parsed = JSON.parse(lastResponse.body);
      expect(parsed.error).toContain('Too many requests');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('rejects malformed and oversized payloads with clean 400 status without leaking internals', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        message: 'A'.repeat(1500), // Max allowed is 1000 characters
      }),
    };

    const res = await chatHandler(event);
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toContain('Message is too long');
  });

  it('rejects unsupported HTTP methods with 405 Method Not Allowed', async () => {
    const event = {
      httpMethod: 'GET',
      body: null,
    };

    const res = await chatHandler(event);
    expect(res.statusCode).toBe(405);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('Method Not Allowed');
  });
});
