import { access, readFile } from 'node:fs/promises';
import { extname } from 'node:path';

export const DEFAULT_BASE_URL = 'https://api.minimaxi.com';
export const API_SOURCE = 'Minimax-MCP';

function getToken(env = process.env) {
  const token = env.MINIMAX_TOKEN?.trim();
  if (!token) {
    throw new Error('MINIMAX_TOKEN is required. Please export MINIMAX_TOKEN first.');
  }
  return token;
}

function inferMimeFromPath(pathOrUrl) {
  const ext = extname(pathOrUrl.split('?')[0].toLowerCase());
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return null;
  }
}

function normalizeContentType(contentType) {
  if (!contentType) return null;
  const mime = contentType.split(';')[0].trim().toLowerCase();
  return mime.startsWith('image/') ? mime : null;
}

function ensureMiniMaxSuccess(payload) {
  const statusCode = payload?.base_resp?.status_code;
  if (statusCode === undefined || statusCode === 0) return;
  const statusMsg = payload?.base_resp?.status_msg || payload?.base_resp?.msg || 'unknown error';
  throw new Error(`MiniMax API error: status_code=${statusCode}, status_msg=${statusMsg}`);
}

async function postJson(path, body, { fetchImpl = fetch, env = process.env, baseUrl = DEFAULT_BASE_URL } = {}) {
  const token = getToken(env);
  const response = await fetchImpl(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'MM-API-Source': API_SOURCE,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`MiniMax API returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(`MiniMax API HTTP ${response.status}: ${raw.slice(0, 200)}`);
  }

  ensureMiniMaxSuccess(payload);
  return payload;
}

export async function resolveImageInput(image, { fetchImpl = fetch } = {}) {
  if (!image || typeof image !== 'string') {
    throw new Error('image is required');
  }

  if (/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(image)) {
    return image;
  }

  if (/^https?:\/\//i.test(image)) {
    const res = await fetchImpl(image);
    if (!res.ok) {
      throw new Error(`failed to download image url: HTTP ${res.status}`);
    }
    const mime = normalizeContentType(res.headers.get('content-type')) || inferMimeFromPath(image) || 'image/png';
    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  await access(image);
  const data = await readFile(image);
  const mime = inferMimeFromPath(image) || 'image/png';
  return `data:${mime};base64,${data.toString('base64')}`;
}

export async function searchWeb(query, options = {}) {
  if (!query || !query.trim()) {
    throw new Error('query is required');
  }
  return postJson('/v1/coding_plan/search', { q: query.trim() }, options);
}

export async function understandImage({ prompt, image }, options = {}) {
  if (!prompt || !prompt.trim()) {
    throw new Error('prompt is required');
  }
  const imageUrl = await resolveImageInput(image, { fetchImpl: options.fetchImpl });
  return postJson(
    '/v1/coding_plan/vlm',
    {
      prompt: prompt.trim(),
      image_url: imageUrl,
    },
    options,
  );
}
