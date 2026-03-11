import { describe, it, expect, vi, beforeEach } from 'vitest';
import { search, addCitations } from './search.js';

vi.mock('./client.js', () => ({
  createClient: vi.fn(),
  DEFAULT_MODEL: 'gemini-3-flash-preview',
  GROUNDING_TOOL: { googleSearch: {} },
}));

const { createClient } = await import('./client.js');

function makeResponse(text, groundingSupports = null, groundingChunks = null) {
  const response = { text };
  if (groundingSupports || groundingChunks) {
    response.candidates = [{
      groundingMetadata: {
        groundingSupports,
        groundingChunks,
      },
    }];
  } else {
    response.candidates = [{}];
  }
  return response;
}

describe('search', () => {
  let mockGenerateContent;

  beforeEach(() => {
    mockGenerateContent = vi.fn();
    createClient.mockReturnValue({
      models: { generateContent: mockGenerateContent },
    });
  });

  it('should return text when no grounding metadata', async () => {
    mockGenerateContent.mockResolvedValueOnce(
      makeResponse('直接回答内容')
    );

    const result = await search('test query');
    expect(result).toBe('直接回答内容');
  });

  it('should call generateContent with correct default params', async () => {
    mockGenerateContent.mockResolvedValueOnce(
      makeResponse('result')
    );

    await search('test query');

    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-3-flash-preview',
      contents: 'test query',
      config: { tools: [{ googleSearch: {} }] },
    });
  });

  it('should use specified model', async () => {
    mockGenerateContent.mockResolvedValueOnce(
      makeResponse('result')
    );

    await search('test query', { model: 'gemini-2.5-pro-preview' });

    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-2.5-pro-preview');
  });

  it('should return text with citations when grounding metadata exists', async () => {
    const supports = [{
      segment: { endIndex: 11 },
      groundingChunkIndices: [0],
    }];
    const chunks = [{
      web: { uri: 'https://example.com' },
    }];

    mockGenerateContent.mockResolvedValueOnce(
      makeResponse('Hello world test text', supports, chunks)
    );

    const result = await search('test query');
    expect(result).toBe('Hello world[1](https://example.com) test text');
  });

  it('should throw friendly message on 429 quota error', async () => {
    const quotaError = new Error('quota exceeded');
    quotaError.status = 429;
    mockGenerateContent.mockRejectedValueOnce(quotaError);

    await expect(search('test query')).rejects.toThrow('Gemini API quota exceeded');
  });

  it('should re-throw non-429 errors as-is', async () => {
    const otherError = new Error('network error');
    mockGenerateContent.mockRejectedValueOnce(otherError);

    await expect(search('test query')).rejects.toThrow('network error');
  });

  it('should return empty string when text is null', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: null,
      candidates: [{}],
    });

    const result = await search('test query');
    expect(result).toBe('');
  });
});

describe('addCitations', () => {
  it('should return original text when no candidates', () => {
    const response = { text: 'Hello', candidates: [] };
    expect(addCitations(response)).toBe('Hello');
  });

  it('should return original text when no groundingMetadata', () => {
    const response = { text: 'Hello', candidates: [{}] };
    expect(addCitations(response)).toBe('Hello');
  });

  it('should return original text when no groundingSupports', () => {
    const response = {
      text: 'Hello',
      candidates: [{ groundingMetadata: {} }],
    };
    expect(addCitations(response)).toBe('Hello');
  });

  it('should insert single citation at correct position', () => {
    const response = {
      text: 'Hello world test',
      candidates: [{
        groundingMetadata: {
          groundingSupports: [{
            segment: { endIndex: 11 },
            groundingChunkIndices: [0],
          }],
          groundingChunks: [{
            web: { uri: 'https://a.com' },
          }],
        },
      }],
    };
    expect(addCitations(response)).toBe('Hello world[1](https://a.com) test');
  });

  it('should insert multiple citations at correct positions', () => {
    const response = {
      text: 'First part. Second part.',
      candidates: [{
        groundingMetadata: {
          groundingSupports: [
            { segment: { endIndex: 11 }, groundingChunkIndices: [0] },
            { segment: { endIndex: 24 }, groundingChunkIndices: [1] },
          ],
          groundingChunks: [
            { web: { uri: 'https://a.com' } },
            { web: { uri: 'https://b.com' } },
          ],
        },
      }],
    };
    expect(addCitations(response)).toBe(
      'First part.[1](https://a.com) Second part.[2](https://b.com)'
    );
  });

  it('should handle multiple chunk indices per support', () => {
    const response = {
      text: 'Some fact here.',
      candidates: [{
        groundingMetadata: {
          groundingSupports: [{
            segment: { endIndex: 14 },
            groundingChunkIndices: [0, 1],
          }],
          groundingChunks: [
            { web: { uri: 'https://a.com' } },
            { web: { uri: 'https://b.com' } },
          ],
        },
      }],
    };
    expect(addCitations(response)).toBe(
      'Some fact here[1](https://a.com), [2](https://b.com).'
    );
  });

  it('should skip supports with missing endIndex', () => {
    const response = {
      text: 'Hello world',
      candidates: [{
        groundingMetadata: {
          groundingSupports: [{
            segment: {},
            groundingChunkIndices: [0],
          }],
          groundingChunks: [{ web: { uri: 'https://a.com' } }],
        },
      }],
    };
    expect(addCitations(response)).toBe('Hello world');
  });

  it('should skip supports with empty groundingChunkIndices', () => {
    const response = {
      text: 'Hello world',
      candidates: [{
        groundingMetadata: {
          groundingSupports: [{
            segment: { endIndex: 5 },
            groundingChunkIndices: [],
          }],
          groundingChunks: [{ web: { uri: 'https://a.com' } }],
        },
      }],
    };
    expect(addCitations(response)).toBe('Hello world');
  });

  it('should skip chunk indices with no uri', () => {
    const response = {
      text: 'Hello world',
      candidates: [{
        groundingMetadata: {
          groundingSupports: [{
            segment: { endIndex: 5 },
            groundingChunkIndices: [0],
          }],
          groundingChunks: [{ web: {} }],
        },
      }],
    };
    expect(addCitations(response)).toBe('Hello world');
  });
});
