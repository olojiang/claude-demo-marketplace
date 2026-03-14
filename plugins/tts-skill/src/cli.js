#!/usr/bin/env node

import { UniversalEdgeTTS, listVoicesUniversal } from 'edge-tts-universal';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';
const DEFAULT_OUT_DIR = '/tmp';

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
  console.error(`tts - ${msg}`);
  process.exit(1);
}

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (e) {
    fail(`无法创建目录: ${dir} - ${e.message}`);
  }
}

async function runVoices(filter) {
  const voices = await listVoicesUniversal();
  let list = voices;
  if (filter) {
    const f = filter.toLowerCase();
    list = voices.filter(
      (v) =>
        (v.ShortName && v.ShortName.toLowerCase().includes(f)) ||
        (v.Locale && v.Locale.toLowerCase().includes(f)) ||
        (v.Gender && v.Gender.toLowerCase().includes(f))
    );
  }
  list.sort((a, b) => (a.ShortName || '').localeCompare(b.ShortName || ''));
  return list;
}

async function runSynthesize(text, voice, outPath) {
  const tts = new UniversalEdgeTTS(text, voice);
  const result = await tts.synthesize();
  const buf = Buffer.from(await result.audio.arrayBuffer());
  await ensureDir(dirname(outPath));
  await writeFile(outPath, buf);
  return outPath;
}

const VOICE_CMDS = ['voices', 'love'];
const SYN_CMDS = ['synthesize', 'syn', 'say'];

async function main() {
  if (!cmd || VOICE_CMDS.includes(cmd)) {
    const filter = arg('filter') || shortArg('f', 'filter');
    const list = await runVoices(filter);
    console.log(JSON.stringify(list.map((v) => ({
      ShortName: v.ShortName,
      Locale: v.Locale,
      Gender: v.Gender,
      FriendlyName: v.FriendlyName,
    })), null, 2));
    return;
  }

  if (SYN_CMDS.includes(cmd) || (!VOICE_CMDS.includes(cmd) && cmd && !cmd.startsWith('-'))) {
    const text = arg('text') || shortArg('t', 'text') || (SYN_CMDS.includes(cmd) ? args[1] : cmd);
    const voice = arg('voice') || shortArg('v', 'voice') || DEFAULT_VOICE;
    let outPath = arg('out') || shortArg('o', 'out');
    if (!text) fail('需提供 --text 或 -t');
    if (!outPath) {
      const base = arg('dir') || shortArg('d', 'dir') || DEFAULT_OUT_DIR;
      const ts = Date.now();
      outPath = `${base}/tts_${ts}.mp3`;
    }
    if (!outPath.endsWith('.mp3')) outPath += '.mp3';
    const path = await runSynthesize(text, voice, outPath);
    console.log(JSON.stringify({ ok: true, path }));
    return;
  }

  fail(`未知命令: ${cmd}。支持: voices, love, synthesize`);
}

main().catch((e) => {
  fail(e.message);
});
