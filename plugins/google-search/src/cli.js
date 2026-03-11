#!/usr/bin/env node

import { search } from './search.js';

const USAGE = `google-search - Web search powered by Google Gemini grounding

Usage:
  google-search search <query>     Search the web via Google Gemini
  google-search help               Show this help message

Options:
  --model <model>                  Model name (default: gemini-3-flash-preview)

Environment:
  GEMINI_API_KEY                   Required. Google AI API key

Examples:
  google-search search "Who won the euro 2024?"
  google-search search "latest news about AI" --model gemini-2.5-pro-preview`;

export function parseArgs(argv) {
  const args = { _: [] };
  let i = 0;
  while (i < argv.length) {
    if (argv[i] === '--model' && i + 1 < argv.length) {
      args.model = argv[++i];
    } else {
      args._.push(argv[i]);
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
    process.exit(0);
  }

  if (command !== 'search') {
    console.error(`unknown command: ${command}`);
    console.log(USAGE);
    process.exit(1);
  }

  const query = args._.slice(1).join(' ');
  if (!query) {
    console.error('search query is required');
    process.exit(1);
  }

  try {
    const result = await search(query, { model: args.model });
    console.log(result);
  } catch (err) {
    console.error(`search failed: ${err.message}`);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''));
if (isDirectRun) {
  main();
}
