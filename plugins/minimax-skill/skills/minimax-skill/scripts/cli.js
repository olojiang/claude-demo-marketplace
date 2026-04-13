#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { searchWeb, understandImage } from './client.js';

const USAGE = `minimax-skill - MiniMax coding_plan API CLI

Usage:
  minimax-skill search <query>
  minimax-skill understand-image --prompt <text> --image <path|url|data-url>
  minimax-skill help

Options:
  -p, --prompt <text>            Prompt for image understanding
  -i, --image <input>            Local path, http(s) url, or data:image/...;base64

Environment:
  MINIMAX_TOKEN                  Required. MiniMax API token

Examples:
  ./scripts/cli.js search "Python 3.12 release highlights"
  ./scripts/cli.js understand-image --prompt "请描述这张图" --image ./demo.png
`;

export function parseArgs(argv) {
  const command = argv[0] || 'help';
  const options = {};
  const positionals = [];

  for (let i = 1; i < argv.length; i += 1) {
    const token = argv[i];
    if ((token === '--prompt' || token === '-p') && i + 1 < argv.length) {
      options.prompt = argv[i + 1];
      i += 1;
      continue;
    }
    if ((token === '--image' || token === '-i') && i + 1 < argv.length) {
      options.image = argv[i + 1];
      i += 1;
      continue;
    }
    positionals.push(token);
  }

  return { command, options, positionals };
}

export async function run(argv, {
  writeOut = (msg) => console.log(msg),
  writeErr = (msg) => console.error(msg),
  deps = { searchWeb, understandImage },
} = {}) {
  const { command, options, positionals } = parseArgs(argv);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    writeOut(USAGE);
    return 0;
  }

  try {
    if (command === 'search') {
      const query = positionals.join(' ').trim();
      if (!query) {
        writeErr('search query is required');
        return 1;
      }
      const result = await deps.searchWeb(query);
      writeOut(JSON.stringify(result, null, 2));
      return 0;
    }

    if (command === 'understand-image') {
      if (!options.prompt) {
        writeErr('--prompt is required');
        return 1;
      }
      if (!options.image) {
        writeErr('--image is required');
        return 1;
      }
      const result = await deps.understandImage({
        prompt: options.prompt,
        image: options.image,
      });
      writeOut(JSON.stringify(result, null, 2));
      return 0;
    }

    writeErr(`unknown command: ${command}`);
    writeOut(USAGE);
    return 1;
  } catch (error) {
    writeErr(`minimax-skill failed: ${error.message}`);
    return 1;
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const code = await run(process.argv.slice(2));
  process.exit(code);
}
