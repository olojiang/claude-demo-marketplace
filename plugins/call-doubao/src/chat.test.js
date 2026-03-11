import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chat } from './chat.js';

vi.mock('./client.js', () => ({
  request: vi.fn(),
  DEFAULT_CHAT_MODEL: 'doubao',
}));

vi.mock('./resolve-image.js', () => ({
  resolveImage: vi.fn((input) => `resolved:${input}`),
}));

const { request } = await import('./client.js');
const { resolveImage } = await import('./resolve-image.js');

function makeChatResponse(content) {
  return {
    choices: [{ message: { content } }],
  };
}

describe('chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveImage.mockImplementation((input) => `resolved:${input}`);
  });

  it('should send text-only message', async () => {
    request.mockResolvedValue(makeChatResponse('你好！'));

    const result = await chat('你好');

    expect(request).toHaveBeenCalledWith('/v1/chat/completions', {
      model: 'doubao',
      messages: [{ role: 'user', content: '你好' }],
      stream: false,
    });
    expect(result).toBe('你好！');
    expect(resolveImage).not.toHaveBeenCalled();
  });

  it('should use custom model', async () => {
    request.mockResolvedValue(makeChatResponse('hi'));

    await chat('hello', { model: 'custom-model' });

    expect(request).toHaveBeenCalledWith('/v1/chat/completions', expect.objectContaining({
      model: 'custom-model',
    }));
  });

  it('should call resolveImage and build multimodal content', async () => {
    request.mockResolvedValue(makeChatResponse('这是一只猫'));
    resolveImage.mockReturnValue('https://example.com/cat.jpg');

    await chat('描述这张图片', { image: 'https://example.com/cat.jpg' });

    expect(resolveImage).toHaveBeenCalledWith('https://example.com/cat.jpg');

    const content = request.mock.calls[0][1].messages[0].content;
    expect(Array.isArray(content)).toBe(true);
    expect(content[0]).toEqual({ type: 'text', text: '描述这张图片' });
    expect(content[1]).toEqual({
      type: 'image_url',
      image_url: { url: 'https://example.com/cat.jpg' },
    });
  });

  it('should delegate local file path to resolveImage', async () => {
    request.mockResolvedValue(makeChatResponse('ok'));
    resolveImage.mockReturnValue('data:image/png;base64,abc');

    await chat('看图', { image: '/Users/me/photo.png' });

    expect(resolveImage).toHaveBeenCalledWith('/Users/me/photo.png');

    const content = request.mock.calls[0][1].messages[0].content;
    expect(content[1].image_url.url).toBe('data:image/png;base64,abc');
  });

  it('should delegate base64 string to resolveImage', async () => {
    request.mockResolvedValue(makeChatResponse('ok'));
    resolveImage.mockReturnValue('data:image/jpeg;base64,iVBOR');

    await chat('看图', { image: 'iVBOR' });

    expect(resolveImage).toHaveBeenCalledWith('iVBOR');
    const content = request.mock.calls[0][1].messages[0].content;
    expect(content[1].image_url.url).toBe('data:image/jpeg;base64,iVBOR');
  });

  it('should return empty string when no choices', async () => {
    request.mockResolvedValue({});

    const result = await chat('你好');
    expect(result).toBe('');
  });

  it('should return empty string when content is null', async () => {
    request.mockResolvedValue({ choices: [{ message: { content: null } }] });

    const result = await chat('你好');
    expect(result).toBe('');
  });
});
