import test from 'node:test';
import assert from 'node:assert/strict';

import { parseArgs, run } from '../skills/minimax-skill/scripts/cli.js';

test('parseArgs should parse understand-image options', () => {
  const parsed = parseArgs(['understand-image', '--prompt', '描述一下', '--image', './a.png']);
  assert.equal(parsed.command, 'understand-image');
  assert.equal(parsed.options.prompt, '描述一下');
  assert.equal(parsed.options.image, './a.png');
});

test('run should call searchWeb and print json', async () => {
  const out = [];
  const err = [];
  let query = null;

  const code = await run(['search', '最新', 'AI', '新闻'], {
    writeOut: (msg) => out.push(msg),
    writeErr: (msg) => err.push(msg),
    deps: {
      searchWeb: async (q) => {
        query = q;
        return { base_resp: { status_code: 0 }, organic: [{ title: 't' }] };
      },
      understandImage: async () => {
        throw new Error('not expected');
      },
    },
  });

  assert.equal(code, 0);
  assert.equal(query, '最新 AI 新闻');
  assert.equal(err.length, 0);
  assert.match(out.join('\n'), /"organic"/);
});
