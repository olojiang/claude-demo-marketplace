import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  getFollowsPath,
  listFollows,
  addFollow,
  removeFollow,
  updateFollow,
  getFollow,
} from '../src/follows.js';

const validStock = { name: 'AMD', code: 'AMD', stock: '美股' };

let testDir;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), 'jw-stock-test-'));
  process.env.STOCK_DIR = testDir;
});

afterEach(() => {
  delete process.env.STOCK_DIR;
  if (testDir) rmSync(testDir, { recursive: true, force: true });
});

describe('follows CRUD', () => {
  it('listFollows returns empty array when no follows.json', () => {
    expect(listFollows()).toEqual([]);
  });

  it('addFollow adds and persists one stock', () => {
    addFollow(validStock);
    const list = listFollows();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject(validStock);
    expect(list[0].id).toBeDefined();
  });

  it('addFollow rejects invalid stock type', () => {
    expect(() => addFollow({ name: 'X', code: 'X', stock: '未知' }))
      .toThrow(/stock must be one of/);
  });

  it('addFollow rejects missing required fields', () => {
    expect(() => addFollow({ name: 'X' })).toThrow(/Required fields/);
  });

  it('removeFollow removes by code', () => {
    addFollow(validStock);
    removeFollow('AMD');
    expect(listFollows()).toEqual([]);
  });

  it('removeFollow does nothing when code not found', () => {
    addFollow(validStock);
    removeFollow('INVALID');
    expect(listFollows()).toHaveLength(1);
  });

  it('updateFollow updates existing stock', () => {
    addFollow(validStock);
    updateFollow('AMD', { name: '超微半导体' });
    const list = listFollows();
    expect(list[0].name).toBe('超微半导体');
    expect(list[0].code).toBe('AMD');
  });

  it('getFollow returns single by code', () => {
    addFollow(validStock);
    const f = getFollow('AMD');
    expect(f).toMatchObject(validStock);
  });

  it('getFollow returns null when not found', () => {
    expect(getFollow('NOTEXIST')).toBeNull();
  });

  it('addFollow does not duplicate same code', () => {
    addFollow(validStock);
    addFollow({ ...validStock, name: 'AMD2' });
    const list = listFollows();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('AMD2');
  });
});
