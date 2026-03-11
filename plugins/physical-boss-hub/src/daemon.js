#!/usr/bin/env node

/**
 * Memory Channel Daemon
 *
 * PM2 managed process for the memory-channel pattern:
 * - Loads channel state from disk on startup
 * - Keeps everything in memory (Map) for fast read access
 * - Periodically syncs with disk (detects CLI writes)
 * - Logs channel activity for observability
 * - Graceful shutdown on SIGINT/SIGTERM
 */

import { join } from 'node:path';
import { readJSON, ensureDir, getDataDir, listDirs } from './store.js';

const SYNC_INTERVAL_MS = 5000;

class MemoryChannelStore {
  constructor(dataDir) {
    this.channelsDir = join(dataDir, 'channels');
    this.cache = new Map();
    ensureDir(this.channelsDir);
  }

  loadAll() {
    const names = listDirs(this.channelsDir);
    for (const name of names) {
      const meta = readJSON(join(this.channelsDir, name, 'meta.json'), null);
      const messages = readJSON(join(this.channelsDir, name, 'messages.json'), []);
      if (meta) {
        this.cache.set(name, { meta, messages, messageCount: messages.length });
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
        this.cache.set(name, { meta: diskMeta, messages: diskMessages, messageCount: diskMessages.length });
        console.log(`daemon syncFromDisk new channel detected: "${name}"`);
        continue;
      }

      const cached = this.cache.get(name);
      if (diskMessages.length !== cached.messageCount) {
        cached.messages = diskMessages;
        cached.meta = diskMeta;
        cached.messageCount = diskMessages.length;
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
}

function main() {
  const dataDir = getDataDir();
  const store = new MemoryChannelStore(dataDir);

  console.log(`daemon main starting, dataDir=${dataDir}`);
  store.loadAll();

  const timer = setInterval(() => {
    store.syncFromDisk();
  }, SYNC_INTERVAL_MS);

  function cleanup() {
    console.log('daemon cleanup shutting down...');
    clearInterval(timer);
    console.log('daemon cleanup complete');
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  console.log(`daemon main running (sync every ${SYNC_INTERVAL_MS}ms)`);
}

main();
