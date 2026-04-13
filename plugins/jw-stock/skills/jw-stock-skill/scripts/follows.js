import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const VALID_STOCK_TYPES = ['美股', '港股', 'A 股'];

function getStockDir() {
  return process.env.STOCK_DIR || join(process.env.HOME || process.env.USERPROFILE || '', '.stock');
}

export function getFollowsPath() {
  return join(getStockDir(), 'follows.json');
}

function loadFollows() {
  const path = getFollowsPath();
  if (!existsSync(path)) return [];
  try {
    const raw = readFileSync(path, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveFollows(arr) {
  const path = getFollowsPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(arr, null, 2), 'utf-8');
}

function generateId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function validateStock(s) {
  if (!s || typeof s !== 'object') throw new Error('Required fields: name, code, stock');
  if (!s.name || !s.code || !s.stock) throw new Error('Required fields: name, code, stock');
  if (!VALID_STOCK_TYPES.includes(s.stock)) {
    throw new Error(`stock must be one of: ${VALID_STOCK_TYPES.join(', ')}`);
  }
  return true;
}

export function listFollows() {
  return loadFollows();
}

export function addFollow(stock) {
  validateStock(stock);
  const list = loadFollows();
  const idx = list.findIndex((f) => f.code === stock.code);
  const item = {
    id: idx >= 0 ? list[idx].id : generateId(),
    name: stock.name,
    code: stock.code,
    stock: stock.stock,
  };
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }
  saveFollows(list);
  return item;
}

export function removeFollow(code) {
  const list = loadFollows();
  const filtered = list.filter((f) => f.code !== code);
  if (filtered.length === list.length) return null;
  saveFollows(filtered);
  return true;
}

export function updateFollow(code, updates) {
  const list = loadFollows();
  const idx = list.findIndex((f) => f.code === code);
  if (idx < 0) return null;
  const current = list[idx];
  const merged = { ...current };
  if (updates.name !== undefined) merged.name = updates.name;
  if (updates.code !== undefined) merged.code = updates.code;
  if (updates.stock !== undefined) {
    if (!VALID_STOCK_TYPES.includes(updates.stock)) {
      throw new Error(`stock must be one of: ${VALID_STOCK_TYPES.join(', ')}`);
    }
    merged.stock = updates.stock;
  }
  list[idx] = merged;
  saveFollows(list);
  return merged;
}

export function getFollow(code) {
  const list = loadFollows();
  return list.find((f) => f.code === code) ?? null;
}
