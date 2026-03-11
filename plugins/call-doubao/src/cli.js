#!/usr/bin/env node

import { chat } from './chat.js';
import { generateImage } from './image.js';
import { checkToken } from './token.js';

const USAGE = `call-doubao - Doubao AI multi-capability tool

Usage:
  call-doubao chat <text>                   Text Q&A
  call-doubao chat <text> --image <url>     Vision Q&A (image + text)
  call-doubao image <prompt>                Text-to-image
  call-doubao image <prompt> --image <url>  Image-to-image
  call-doubao token-check <token>           Check token validity
  call-doubao help                          Show this help

Options:
  --model <model>    Model name (default: doubao / Seedream 4.0)
  --image <url>      Image URL or base64 string
  --ratio <ratio>    Image ratio, e.g. 1:1, 4:3, 16:9 (default: 1:1)
  --style <style>    Image style, e.g. 写实, 卡通 (default: 写实)

Environment:
  DOUBAO_API_KEY     Required. API key for authentication.
`;

export function parseArgs(argv) {
  const args = { _: [] };
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--model' && i + 1 < argv.length) {
      args.model = argv[++i];
    } else if (arg === '--image' && i + 1 < argv.length) {
      args.image = argv[++i];
    } else if (arg === '--ratio' && i + 1 < argv.length) {
      args.ratio = argv[++i];
    } else if (arg === '--style' && i + 1 < argv.length) {
      args.style = argv[++i];
    } else {
      args._.push(arg);
    }

    i++;
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || command === 'help') {
    console.log(USAGE);
    return;
  }

  if (command === 'chat') {
    const text = args._.slice(1).join(' ');
    if (!text) {
      console.error('chat: missing <text> argument');
      process.exit(1);
    }
    const result = await chat(text, { model: args.model, image: args.image });
    console.log(result);
    return;
  }

  if (command === 'image') {
    const prompt = args._.slice(1).join(' ');
    if (!prompt) {
      console.error('image: missing <prompt> argument');
      process.exit(1);
    }
    const result = await generateImage(prompt, {
      model: args.model,
      ratio: args.ratio,
      style: args.style,
      image: args.image,
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'token-check') {
    const token = args._[1];
    if (!token) {
      console.error('token-check: missing <token> argument');
      process.exit(1);
    }
    const result = await checkToken(token);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.error(`unknown command: ${command}`);
  console.log(USAGE);
  process.exit(1);
}

const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''));
if (isDirectRun) {
  main();
}
