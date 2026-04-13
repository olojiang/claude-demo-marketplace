import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const CLI_PATH = resolve(process.cwd(), 'src/cli.js');

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: 'utf8',
  });
}

describe('remotion cli', () => {
  it('fails when content is missing', () => {
    const result = runCli([]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('需提供 --content / -c 或直接传文本内容');
  });

  it('fails when duration is invalid', () => {
    const result = runCli(['--content', 'hello', '--duration', 'abc']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('duration 须为正数');
  });
});
