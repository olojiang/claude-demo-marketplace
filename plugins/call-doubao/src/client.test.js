import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiKey, request, DEFAULT_CHAT_MODEL, DEFAULT_IMAGE_MODEL } from './client.js';

describe('client', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  describe('getApiKey', () => {
    it('should return api key from env', () => {
      process.env.DOUBAO_API_KEY = 'test-key-123';
      expect(getApiKey()).toBe('test-key-123');
    });

    it('should throw when DOUBAO_API_KEY is not set', () => {
      delete process.env.DOUBAO_API_KEY;
      expect(() => getApiKey()).toThrow('DOUBAO_API_KEY environment variable is required');
    });
  });

  describe('request', () => {
    it('should send POST with correct headers and body', async () => {
      process.env.DOUBAO_API_KEY = 'my-key';

      const mockResponse = { ok: true, json: () => Promise.resolve({ result: 'ok' }) };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const data = await request('/v1/test', { foo: 'bar' });

      expect(fetch).toHaveBeenCalledWith(
        'http://ssh.olojiang.dpdns.org:8000/v1/test',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer my-key',
          },
          body: JSON.stringify({ foo: 'bar' }),
        },
      );
      expect(data).toEqual({ result: 'ok' });
    });

    it('should throw on non-ok response', async () => {
      process.env.DOUBAO_API_KEY = 'my-key';

      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('invalid token'),
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      await expect(request('/v1/test', {})).rejects.toThrow('request failed [401]: invalid token');
    });
  });

  describe('constants', () => {
    it('should export correct default models', () => {
      expect(DEFAULT_CHAT_MODEL).toBe('doubao');
      expect(DEFAULT_IMAGE_MODEL).toBe('Seedream 4.0');
    });
  });
});
