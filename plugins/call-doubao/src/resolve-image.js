import { readFileSync, existsSync } from 'node:fs';
import { extname } from 'node:path';

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
};

export function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_MAP[ext] || 'image/jpeg';
}

export function resolveImage(input) {
  if (!input) return null;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }

  if (input.startsWith('data:')) {
    return input;
  }

  if (existsSync(input)) {
    const buffer = readFileSync(input);
    const base64 = buffer.toString('base64');
    const mime = getMimeType(input);
    return `data:${mime};base64,${base64}`;
  }

  if (input.includes('/') || input.includes('\\') || extname(input)) {
    const err = new Error(`resolveImage: file not found: ${input}`);
    err.code = 'FILE_NOT_FOUND';
    throw err;
  }

  return `data:image/jpeg;base64,${input}`;
}
