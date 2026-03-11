import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkToken } from './token.js';

vi.mock('./client.js', () => ({
  request: vi.fn(),
}));

const { request } = await import('./client.js');

describe('checkToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send token to /token/check', async () => {
    const resp = { valid: true, expires_at: '2026-12-31' };
    request.mockResolvedValue(resp);

    const result = await checkToken('abc-token-123');

    expect(request).toHaveBeenCalledWith('/token/check', { token: 'abc-token-123' });
    expect(result).toEqual(resp);
  });

  it('should return invalid token response', async () => {
    const resp = { valid: false, message: 'token expired' };
    request.mockResolvedValue(resp);

    const result = await checkToken('expired-token');

    expect(result).toEqual(resp);
  });

  it('should propagate request errors', async () => {
    request.mockRejectedValue(new Error('request failed [401]: unauthorized'));

    await expect(checkToken('bad')).rejects.toThrow('request failed [401]: unauthorized');
  });
});
