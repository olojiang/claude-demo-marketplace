import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readJSON, writeJSON, getDataDir } from './store.js';

function registryPath(entityType) {
  return join(getDataDir(), `${entityType}s.json`);
}

function parseCsv(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

export function register(entityType, { name, description, tags, actions }) {
  const filepath = registryPath(entityType);
  const entities = readJSON(filepath, []);

  const entity = {
    id: randomUUID(),
    name,
    description: description || '',
    tags: parseCsv(tags),
    actions: parseCsv(actions),
    type: entityType,
    createdAt: new Date().toISOString(),
  };

  entities.push(entity);
  writeJSON(filepath, entities);
  return entity;
}

export function listEntities(entityType) {
  return readJSON(registryPath(entityType), []);
}

export function getEntity(entityType, id) {
  const entities = readJSON(registryPath(entityType), []);
  return entities.find(e => e.id === id || e.id.startsWith(id)) || null;
}

export function removeEntity(entityType, id) {
  const filepath = registryPath(entityType);
  const entities = readJSON(filepath, []);
  const idx = entities.findIndex(e => e.id === id || e.id.startsWith(id));
  if (idx === -1) return null;
  const [removed] = entities.splice(idx, 1);
  writeJSON(filepath, entities);
  return removed;
}
