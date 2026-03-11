import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveImage, getMimeType } from './resolve-image.js';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

const { existsSync, readFileSync } = await import('node:fs');

describe('getMimeType', () => {
  it('should return image/jpeg for .jpg', () => {
    expect(getMimeType('/path/to/photo.jpg')).toBe('image/jpeg');
  });

  it('should return image/jpeg for .jpeg', () => {
    expect(getMimeType('image.jpeg')).toBe('image/jpeg');
  });

  it('should return image/png for .png', () => {
    expect(getMimeType('screenshot.png')).toBe('image/png');
  });

  it('should return image/gif for .gif', () => {
    expect(getMimeType('anim.gif')).toBe('image/gif');
  });

  it('should return image/webp for .webp', () => {
    expect(getMimeType('photo.webp')).toBe('image/webp');
  });

  it('should return image/jpeg for unknown extension', () => {
    expect(getMimeType('file.xyz')).toBe('image/jpeg');
  });

  it('should be case insensitive on extension', () => {
    expect(getMimeType('Photo.PNG')).toBe('image/png');
    expect(getMimeType('image.JPG')).toBe('image/jpeg');
  });
});

describe('resolveImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null for falsy input', () => {
    expect(resolveImage(null)).toBeNull();
    expect(resolveImage(undefined)).toBeNull();
    expect(resolveImage('')).toBeNull();
  });

  it('should pass through http URL', () => {
    const url = 'http://example.com/img.jpg';
    expect(resolveImage(url)).toBe(url);
    expect(existsSync).not.toHaveBeenCalled();
  });

  it('should pass through https URL', () => {
    const url = 'https://cdn.example.com/photo.png';
    expect(resolveImage(url)).toBe(url);
  });

  it('should pass through data: URI', () => {
    const uri = 'data:image/png;base64,abc123';
    expect(resolveImage(uri)).toBe(uri);
  });

  it('should read local file and convert to base64 data URI (png)', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(Buffer.from('fake-png-data'));

    const result = resolveImage('/Users/me/photo.png');

    expect(existsSync).toHaveBeenCalledWith('/Users/me/photo.png');
    expect(readFileSync).toHaveBeenCalledWith('/Users/me/photo.png');

    const expectedBase64 = Buffer.from('fake-png-data').toString('base64');
    expect(result).toBe(`data:image/png;base64,${expectedBase64}`);
  });

  it('should read local file and convert to base64 data URI (jpg)', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(Buffer.from('jpeg-bytes'));

    const result = resolveImage('./photos/cat.jpg');

    const expectedBase64 = Buffer.from('jpeg-bytes').toString('base64');
    expect(result).toBe(`data:image/jpeg;base64,${expectedBase64}`);
  });

  it('should read local file with webp extension', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(Buffer.from('webp-data'));

    const result = resolveImage('/tmp/image.webp');

    const expectedBase64 = Buffer.from('webp-data').toString('base64');
    expect(result).toBe(`data:image/webp;base64,${expectedBase64}`);
  });

  it('should treat non-existent path as raw base64 string', () => {
    existsSync.mockReturnValue(false);

    const raw = 'iVBORw0KGgoAAAANSUhEUg==';
    const result = resolveImage(raw);

    expect(result).toBe(`data:image/jpeg;base64,${raw}`);
  });

  it('should handle relative path', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(Buffer.from('data'));

    resolveImage('./relative/path/img.png');

    expect(existsSync).toHaveBeenCalledWith('./relative/path/img.png');
    expect(readFileSync).toHaveBeenCalledWith('./relative/path/img.png');
  });
});
