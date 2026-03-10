#!/usr/bin/env node

import { search } from './search.js';

const USAGE = `kimi-search - Web search powered by Kimi (Moonshot AI)

Usage:
  kimi-search search <query>       Search the web via Kimi
  kimi-search help                 Show this help message

Options:
  --model <model>                  Model name (default: kimi-k2.5)
  --temperature <number>           Temperature for instant mode (default: 0.6)
  --thinking                       Enable thinking mode (temperature forced to 1)

Environment:
  KIMI_API_KEY                     Required. Moonshot AI API key

Examples:
  kimi-search search "2024年诺贝尔物理学奖得主是谁?"
  kimi-search search "latest news about AI" --model kimi-k2.5
  kimi-search search "complex reasoning task" --thinking`;

export function parseArgs(argv) {
  const args = { _: [] };
  let i = 0;
  while (i < argv.length) {
    if (argv[i] === '--model' && i + 1 < argv.length) {
      args.model = argv[++i];
    } else if (argv[i] === '--temperature' && i + 1 < argv.length) {
      args.temperature = parseFloat(argv[++i]);
    } else if (argv[i] === '--thinking') {
      args.thinking = true;
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
    const result = await search(query, {
      model: args.model,
      temperature: args.temperature,
      thinking: args.thinking,
    });
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
