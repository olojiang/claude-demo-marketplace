import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  searchWeb,
  understandImage,
  resolveImageInput,
} from '../skills/minimax-skill/scripts/client.js';

test('searchWeb should call /v1/coding_plan/search with required headers', async () => {
  process.env.MINIMAX_TOKEN = 'test-token';
  let called = null;

  const fakeFetch = async (url, init) => {
    called = { url, init };
    return new Response(JSON.stringify({ base_resp: { status_code: 0 }, organic: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  await searchWeb('python 3.12', { fetchImpl: fakeFetch });

  assert.equal(called.url, 'https://api.minimaxi.com/v1/coding_plan/search');
  assert.equal(called.init.method, 'POST');
  assert.equal(called.init.headers.Authorization, 'Bearer test-token');
  assert.equal(called.init.headers['MM-API-Source'], 'Minimax-MCP');
  assert.deepEqual(JSON.parse(called.init.body), { q: 'python 3.12' });
});

test('understandImage should call /v1/coding_plan/vlm with prompt and image_url', async () => {
  process.env.MINIMAX_TOKEN = 'test-token';
  let called = null;

  const fakeFetch = async (url, init) => {
    called = { url, init };
    return new Response(JSON.stringify({ base_resp: { status_code: 0 }, summary: 'ok' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  await understandImage(
    { prompt: 'describe', image: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' },
    { fetchImpl: fakeFetch },
  );

  assert.equal(called.url, 'https://api.minimaxi.com/v1/coding_plan/vlm');
  assert.deepEqual(JSON.parse(called.init.body), {
    prompt: 'describe',
    image_url: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
  });
});

test('resolveImageInput should convert local file to data url', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'minimax-skill-'));
  const imgPath = join(dir, 'tiny.png');
  await writeFile(imgPath, Buffer.from([0x89, 0x50, 0x4e, 0x47]));

  const output = await resolveImageInput(imgPath);
  assert.match(output, /^data:image\/png;base64,/);
});

test('searchWeb should fail when MINIMAX_TOKEN missing', async () => {
  delete process.env.MINIMAX_TOKEN;
  await assert.rejects(() => searchWeb('x'), /MINIMAX_TOKEN/);
});
