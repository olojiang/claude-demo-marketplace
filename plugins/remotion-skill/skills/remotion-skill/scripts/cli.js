#!/usr/bin/env node

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_DIR = '/tmp';
const DEFAULT_DURATION = 5;

const args = process.argv.slice(2);
const cmd = args[0];

function arg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

function shortArg(short, long) {
  const si = args.indexOf(`-${short}`);
  if (si !== -1 && si + 1 < args.length) return args[si + 1];
  return arg(long);
}

function fail(msg) {
  console.error(`remotion-video - ${msg}`);
  process.exit(1);
}

async function runRender(content, durationSeconds, outPath) {
  const localEntryPoint = path.join(__dirname, 'index.ts');
  const pluginRoot = path.resolve(__dirname, '..');
  const pluginEntryPoint = path.join(pluginRoot, 'src/index.ts');
  const entryPoint = existsSync(localEntryPoint) ? localEntryPoint : pluginEntryPoint;

  process.stderr.write('remotion-video - bundling...\n');
  const serveUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const inputProps = {
    content: content || ' ',
    durationInSeconds: durationSeconds,
  };

  process.stderr.write('remotion-video - selecting composition...\n');
  const composition = await selectComposition({
    serveUrl,
    id: 'ContentVideo',
    inputProps,
  });

  await mkdir(path.dirname(outPath), { recursive: true });

  process.stderr.write('remotion-video - rendering...\n');
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: outPath,
    inputProps,
  });

  return outPath;
}

async function main() {
  const posContent = args.find((a) => !a.startsWith('-'));
  const content =
    arg('content') || shortArg('c', 'content') || posContent || null;
  const durationStr = arg('duration') || shortArg('d', 'duration');
  const durationSeconds = durationStr ? parseFloat(durationStr) : DEFAULT_DURATION;
  let outPath = arg('out') || shortArg('o', 'out');

  if (!content) fail('需提供 --content / -c 或直接传文本内容');
  if (Number.isNaN(durationSeconds) || durationSeconds <= 0) fail('duration 须为正数');

  if (!outPath) {
    const base = arg('dir') || shortArg('D', 'dir') || DEFAULT_OUT_DIR;
    const ts = Date.now();
    outPath = path.join(base, `remotion_${ts}.mp4`);
  }
  if (!outPath.endsWith('.mp4')) outPath += '.mp4';

  const result = await runRender(content, durationSeconds, outPath);
  console.log(JSON.stringify({ ok: true, path: result }));
}

main().catch((e) => {
  fail(e.message);
});
