import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const CLI_PATH = resolve(process.cwd(), 'src/cli.js');

function runCli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: 'utf8',
  });
}

describe('tts cli', () => {
  it('fails for unsupported option command', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('未知命令');
  });

  it('fails when synthesize has no text', () => {
    const result = runCli(['synthesize']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('需提供 --text 或 -t');
  });
});
