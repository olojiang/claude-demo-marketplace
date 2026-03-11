import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateImage } from './image.js';

vi.mock('./client.js', () => ({
  request: vi.fn(),
  DEFAULT_IMAGE_MODEL: 'Seedream 4.0',
}));

vi.mock('./resolve-image.js', () => ({
  resolveImage: vi.fn((input) => `resolved:${input}`),
}));

const { request } = await import('./client.js');
const { resolveImage } = await import('./resolve-image.js');

function makeImageResponse(url) {
  return { data: [{ url }] };
}

describe('generateImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveImage.mockImplementation((input) => `resolved:${input}`);
  });

  it('should generate image with default options (text-to-image)', async () => {
    const resp = makeImageResponse('https://cdn.example.com/result.png');
    request.mockResolvedValue(resp);

    const result = await generateImage('机器猫');

    expect(request).toHaveBeenCalledWith('/v1/images/generations', {
      model: 'Seedream 4.0',
      prompt: '机器猫',
      ratio: '1:1',
      style: '写实',
      stream: false,
    });
    expect(result).toEqual(resp);
    expect(resolveImage).not.toHaveBeenCalled();
  });

  it('should use custom ratio and style', async () => {
    request.mockResolvedValue(makeImageResponse('url'));

    await generateImage('学校', { ratio: '4:3', style: '卡通' });

    expect(request).toHaveBeenCalledWith('/v1/images/generations', expect.objectContaining({
      ratio: '4:3',
      style: '卡通',
    }));
  });

  it('should use custom model', async () => {
    request.mockResolvedValue(makeImageResponse('url'));

    await generateImage('test', { model: 'Custom Model' });

    expect(request).toHaveBeenCalledWith('/v1/images/generations', expect.objectContaining({
      model: 'Custom Model',
    }));
  });

  it('should call resolveImage for image-to-image (URL)', async () => {
    request.mockResolvedValue(makeImageResponse('url'));
    resolveImage.mockReturnValue('https://example.com/source.jpg');

    await generateImage('机器猫', { image: 'https://example.com/source.jpg' });

    expect(resolveImage).toHaveBeenCalledWith('https://example.com/source.jpg');
    expect(request).toHaveBeenCalledWith('/v1/images/generations', expect.objectContaining({
      image: 'https://example.com/source.jpg',
    }));
  });

  it('should call resolveImage for local file path', async () => {
    request.mockResolvedValue(makeImageResponse('url'));
    resolveImage.mockReturnValue('data:image/png;base64,abc');

    await generateImage('风格化', { image: '/Users/me/photo.png' });

    expect(resolveImage).toHaveBeenCalledWith('/Users/me/photo.png');
    expect(request).toHaveBeenCalledWith('/v1/images/generations', expect.objectContaining({
      image: 'data:image/png;base64,abc',
    }));
  });

  it('should NOT include image field when not provided', async () => {
    request.mockResolvedValue(makeImageResponse('url'));

    await generateImage('test');

    const body = request.mock.calls[0][1];
    expect(body).not.toHaveProperty('image');
    expect(resolveImage).not.toHaveBeenCalled();
  });
});
