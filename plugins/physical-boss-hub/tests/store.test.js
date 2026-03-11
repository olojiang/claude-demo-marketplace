import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readJSON, writeJSON, ensureDir, getDataDir, listDirs } from '../src/store.js';

let testDir;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), 'store-test-'));
  process.env.BOSS_HUB_DIR = testDir;
});

afterEach(() => {
  delete process.env.BOSS_HUB_DIR;
  delete process.env.MESSAGE_HUB_DIR;
  if (testDir) rmSync(testDir, { recursive: true, force: true });
});

describe('ensureDir', () => {
  it('creates nested directories', () => {
    const nested = join(testDir, 'a', 'b', 'c');
    ensureDir(nested);
    expect(existsSync(nested)).toBe(true);
  });

  it('does not throw on existing directory', () => {
    ensureDir(testDir);
    expect(existsSync(testDir)).toBe(true);
  });
});

describe('readJSON', () => {
  it('returns fallback for non-existent file', () => {
    const result = readJSON(join(testDir, 'nope.json'), []);
    expect(result).toEqual([]);
  });

  it('returns parsed value for valid JSON string', () => {
    const filepath = join(testDir, 'str.json');
    writeJSON(filepath, 'hello');
    const result = readJSON(filepath);
    expect(result).toBe('hello');
  });

  it('parses valid JSON file', () => {
    const filepath = join(testDir, 'data.json');
    writeJSON(filepath, { key: 'value' });
    const result = readJSON(filepath);
    expect(result).toEqual({ key: 'value' });
  });

  it('returns null as default fallback', () => {
    const result = readJSON(join(testDir, 'missing.json'));
    expect(result).toBeNull();
  });
});

describe('writeJSON', () => {
  it('creates parent directories if needed', () => {
    const filepath = join(testDir, 'sub', 'dir', 'file.json');
    writeJSON(filepath, { hello: 'world' });
    expect(readJSON(filepath)).toEqual({ hello: 'world' });
  });

  it('overwrites existing file', () => {
    const filepath = join(testDir, 'overwrite.json');
    writeJSON(filepath, { v: 1 });
    writeJSON(filepath, { v: 2 });
    expect(readJSON(filepath)).toEqual({ v: 2 });
  });
});

describe('listDirs', () => {
  it('returns empty array for non-existent parent', () => {
    expect(listDirs(join(testDir, 'no-such'))).toEqual([]);
  });

  it('lists only directories, not files', () => {
    ensureDir(join(testDir, 'dirs', 'alpha'));
    ensureDir(join(testDir, 'dirs', 'beta'));
    writeJSON(join(testDir, 'dirs', 'file.json'), {});

    const dirs = listDirs(join(testDir, 'dirs'));
    expect(dirs.sort()).toEqual(['alpha', 'beta']);
  });
});

describe('getDataDir', () => {
  it('uses BOSS_HUB_DIR when set', () => {
    const dir = getDataDir();
    expect(dir).toBe(testDir);
  });

  it('falls back to MESSAGE_HUB_DIR', () => {
    delete process.env.BOSS_HUB_DIR;
    const customDir = join(testDir, 'custom-hub');
    process.env.MESSAGE_HUB_DIR = customDir;
    const dir = getDataDir();
    expect(dir).toBe(customDir);
  });
});
