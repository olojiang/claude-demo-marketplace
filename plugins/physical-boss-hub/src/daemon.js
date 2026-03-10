#!/usr/bin/env node

/**
 * Memory Channel Daemon
 *
 * PM2 managed process that demonstrates the memory-channel pattern:
 * - Loads channel state from disk on startup
 * - Keeps everything in memory (Map) for fast access
 * - Periodically syncs with disk (detects CLI writes, flushes dirty state)
 * - Graceful shutdown flushes all pending state
 */

import { join } from 'node:path';
import { readJSON, writeJSON, ensureDir, getDataDir, listDirs } from './store.js';

const SYNC_INTERVAL_MS = 5000;

class MemoryChannelStore {
  constructor(dataDir) {
    this.channelsDir = join(dataDir, 'channels');
    this.cache = new Map();
    this.dirty = new Set();
    ensureDir(this.channelsDir);
  }

  loadAll() {
    const names = listDirs(this.channelsDir);
    for (const name of names) {
      const meta = readJSON(join(this.channelsDir, name, 'meta.json'), null);
      const messages = readJSON(join(this.channelsDir, name, 'messages.json'), []);
      if (meta) {
        this.cache.set(name, { meta, messages });
        console.log(`daemon loadAll channel "${name}" loaded (${messages.length} messages)`);
      }
    }
    console.log(`daemon loadAll total ${this.cache.size} channels in memory`);
  }

  syncFromDisk() {
    const names = listDirs(this.channelsDir);
    for (const name of names) {
      const diskMeta = readJSON(join(this.channelsDir, name, 'meta.json'), null);
      if (!diskMeta) continue;

      const diskMessages = readJSON(join(this.channelsDir, name, 'messages.json'), []);

      if (!this.cache.has(name)) {
        this.cache.set(name, { meta: diskMeta, messages: diskMessages });
        console.log(`daemon syncFromDisk new channel detected: "${name}"`);
        continue;
      }

      const cached = this.cache.get(name);
      if (diskMessages.length !== cached.messages.length) {
        cached.messages = diskMessages;
        cached.meta = diskMeta;
        console.log(`daemon syncFromDisk channel "${name}" updated (${diskMessages.length} messages)`);
      }
    }

    for (const name of this.cache.keys()) {
      if (!names.includes(name)) {
        this.cache.delete(name);
        console.log(`daemon syncFromDisk channel "${name}" removed from disk, evicting cache`);
      }
    }
  }

  flushDirty() {
    if (this.dirty.size === 0) return;
    for (const name of this.dirty) {
      const data = this.cache.get(name);
      if (!data) continue;
      const dir = join(this.channelsDir, name);
      ensureDir(dir);
      writeJSON(join(dir, 'meta.json'), data.meta);
      writeJSON(join(dir, 'messages.json'), data.messages);
      console.log(`daemon flushDirty flushed "${name}"`);
    }
    this.dirty.clear();
  }
}

function main() {
  const dataDir = getDataDir();
  const store = new MemoryChannelStore(dataDir);

  console.log(`daemon main starting, dataDir=${dataDir}`);
  store.loadAll();

  const timer = setInterval(() => {
    store.syncFromDisk();
    store.flushDirty();
  }, SYNC_INTERVAL_MS);

  function cleanup() {
    console.log('daemon cleanup shutting down...');
    clearInterval(timer);
    store.flushDirty();
    console.log('daemon cleanup complete');
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  console.log(`daemon main running (sync every ${SYNC_INTERVAL_MS}ms)`);
}

main();
