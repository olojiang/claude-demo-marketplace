import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CLI = `node ${join(ROOT, 'src', 'cli.js')}`;
let testDir;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), 'jw-stock-cli-'));
  process.env.STOCK_DIR = testDir;
});

afterEach(() => {
  delete process.env.STOCK_DIR;
  if (testDir) rmSync(testDir, { recursive: true, force: true });
});

function run(cmd, opts = {}) {
  return execSync(`${CLI} ${cmd}`, {
    encoding: 'utf-8',
    cwd: ROOT,
    env: { ...process.env, STOCK_DIR: testDir },
    ...opts,
  });
}

describe('cli follows', () => {
  it('follows list returns empty initially', () => {
    const out = run('follows list');
    expect(JSON.parse(out)).toEqual([]);
  });

  it('follows add then list', () => {
    run('follows add --name AMD --code AMD --stock 美股');
    const list = JSON.parse(run('follows list'));
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ name: 'AMD', code: 'AMD', stock: '美股' });
  });

  it('follows remove', () => {
    run('follows add --name AMD --code AMD --stock 美股');
    run('follows remove --code AMD');
    expect(JSON.parse(run('follows list'))).toEqual([]);
  });

  it('follows update', () => {
    run('follows add --name AMD --code AMD --stock 美股');
    run('follows update --code AMD --name 超微');
    const list = JSON.parse(run('follows list'));
    expect(list[0].name).toBe('超微');
  });
});

describe('cli init', () => {
  it('init populates default follows', () => {
    run('init');
    const list = JSON.parse(run('follows list'));
    expect(list.length).toBeGreaterThanOrEqual(10);
    const codes = list.map((f) => f.code);
    expect(codes).toContain('AMD');
    expect(codes).toContain('3690');
    expect(codes).toContain('000100');
  });
});
