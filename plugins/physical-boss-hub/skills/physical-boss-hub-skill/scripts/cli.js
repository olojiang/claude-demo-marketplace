#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { register, listEntities, getEntity, removeEntity } from './registry.js';
import {
  createChannel, listChannels, getChannel, deleteChannel,
  subscribe, unsubscribe, publish, getMessages, getReplies, poll,
} from './channel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKER_SCRIPT = join(__dirname, 'worker.js');
const DEFAULT_CHANNEL = 'hub';

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

function arg(name) {
  const idx = args.indexOf(`--${name}`);
  return (idx !== -1 && idx + 1 < args.length) ? args[idx + 1] : undefined;
}

function out(data) { console.log(JSON.stringify(data, null, 2)); }
function fail(msg) { console.error(`Error: ${msg}`); process.exit(1); }

function requireArgs(names) {
  const missing = names.filter(n => !arg(n));
  if (missing.length) fail(`missing required args: ${missing.map(n => `--${n}`).join(', ')}`);
}

function pmName(entity) {
  return `mhub-${entity.type}-${entity.name}`;
}

function ensureHub() {
  if (!getChannel(DEFAULT_CHANNEL)) {
    createChannel(DEFAULT_CHANNEL, 'memory');
  }
}

function startWorker(entity) {
  const name = pmName(entity);
  try {
    execSync(`pm2 describe "${name}" 2>/dev/null`, { stdio: 'pipe' });
    execSync(`pm2 restart "${name}"`, { stdio: 'pipe' });
  } catch {
    execSync(
      `pm2 start "${WORKER_SCRIPT}" --name "${name}" -- --id ${entity.id}`,
      { stdio: 'pipe' },
    );
  }
  return name;
}

function stopWorker(entity) {
  const name = pmName(entity);
  try { execSync(`pm2 delete "${name}"`, { stdio: 'pipe' }); } catch { /* noop */ }
  return name;
}

try {
  switch (command) {
    case 'device':
    case 'person':  handleRegistry(command); break;
    case 'channel': handleChannel(); break;
    case 'message': await handleMessage(); break;
    case 'worker':  handleWorker(); break;
    default:        printHelp();
  }
} catch (err) {
  fail(err.message);
}

function handleRegistry(type) {
  switch (subcommand) {
    case 'register': {
      requireArgs(['name']);
      const entity = register(type, {
        name: arg('name'),
        description: arg('description'),
        tags: arg('tags'),
        actions: arg('actions'),
      });
      ensureHub();
      subscribe(DEFAULT_CHANNEL, entity.id, type);
      try {
        const pm = startWorker(entity);
        entity._worker = pm;
      } catch { entity._worker = 'pm2 not available'; }
      out(entity);
      break;
    }
    case 'list':
      out(listEntities(type));
      break;
    case 'get':
      requireArgs(['id']);
      out(getEntity(type, arg('id')) || fail(`${type} not found`));
      break;
    case 'remove': {
      requireArgs(['id']);
      const removed = removeEntity(type, arg('id'));
      if (!removed) fail(`${type} not found`);
      try { stopWorker(removed); } catch { /* noop */ }
      out(removed);
      break;
    }
    default:
      fail(`unknown ${type} subcommand: ${subcommand}`);
  }
}

function handleChannel() {
  switch (subcommand) {
    case 'create':
      requireArgs(['name']);
      out(createChannel(arg('name'), arg('type') || 'memory'));
      break;
    case 'list':
      out(listChannels());
      break;
    case 'get':
      requireArgs(['name']);
      out(getChannel(arg('name')) || fail('channel not found'));
      break;
    case 'delete':
      requireArgs(['name']);
      out(deleteChannel(arg('name')) || fail('channel not found'));
      break;
    case 'subscribe':
      requireArgs(['channel', 'subscriber', 'role']);
      out(subscribe(arg('channel'), arg('subscriber'), arg('role')));
      break;
    case 'unsubscribe':
      requireArgs(['channel', 'subscriber']);
      out(unsubscribe(arg('channel'), arg('subscriber')));
      break;
    default:
      fail(`unknown channel subcommand: ${subcommand}`);
  }
}

async function handleMessage() {
  switch (subcommand) {
    case 'publish':
      requireArgs(['channel', 'from', 'from-role', 'content']);
      out(publish(arg('channel'), {
        from: arg('from'),
        fromRole: arg('from-role'),
        to: arg('to'),
        toRole: arg('to-role'),
        content: arg('content'),
        replyTo: arg('reply-to'),
      }));
      break;
    case 'list':
      requireArgs(['channel']);
      out(getMessages(arg('channel'), {
        subscriberId: arg('subscriber'),
        since: arg('since'),
        limit: arg('limit'),
      }));
      break;
    case 'replies':
      requireArgs(['channel', 'message-id']);
      out(getReplies(arg('channel'), arg('message-id')));
      break;
    case 'wait-reply': {
      requireArgs(['channel', 'message-id']);
      const ch = arg('channel');
      const msgId = arg('message-id');
      const timeoutSec = parseInt(arg('timeout') || '60', 10);
      const intervalMs = 3000;
      const maxAttempts = Math.ceil((timeoutSec * 1000) / intervalMs);
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));
      let found = false;
      for (let i = 0; i < maxAttempts; i++) {
        const replies = getReplies(ch, msgId);
        if (replies.length > 0) { out(replies); found = true; break; }
        await sleep(intervalMs);
      }
      if (!found) out([]);
      break;
    }
    case 'poll':
      requireArgs(['channel', 'subscriber']);
      out(poll(arg('channel'), arg('subscriber')));
      break;
    default:
      fail(`unknown message subcommand: ${subcommand}`);
  }
}

function handleWorker() {
  switch (subcommand) {
    case 'start': {
      requireArgs(['id']);
      const id = arg('id');
      const entity = getEntity('person', id) || getEntity('device', id);
      if (!entity) fail('entity not found');
      const pm = startWorker(entity);
      out({ status: 'started', worker: pm, entityId: entity.id });
      break;
    }
    case 'stop': {
      requireArgs(['id']);
      const id = arg('id');
      const entity = getEntity('person', id) || getEntity('device', id);
      if (!entity) fail('entity not found');
      const pm = stopWorker(entity);
      out({ status: 'stopped', worker: pm });
      break;
    }
    case 'status': {
      try {
        const raw = execSync('pm2 jlist', { encoding: 'utf-8', stdio: 'pipe' });
        const all = JSON.parse(raw);
        const workers = all
          .filter(p => p.name.startsWith('mhub-'))
          .map(w => ({
            name: w.name,
            status: w.pm2_env?.status,
            pid: w.pid,
            uptime: w.pm2_env?.pm_uptime,
          }));
        out(workers);
      } catch {
        out([]);
      }
      break;
    }
    default:
      fail(`unknown worker subcommand: ${subcommand}`);
  }
}

function printHelp() {
  console.log(`physical-boss-hub CLI

Registry (auto-starts worker + subscribes to hub channel):
  device register  --name <n> [--description <d>] [--tags <t1,t2>] [--actions <a1,a2>]
  device list | get --id <id> | remove --id <id>
  person register  --name <n> [--description <d>] [--tags <t1,t2>] [--actions <a1,a2>]
  person list | get --id <id> | remove --id <id>

Channel:
  channel create --name <n> [--type memory] | list | get --name <n> | delete --name <n>
  channel subscribe --channel <n> --subscriber <id> --role <person|device|agent>
  channel unsubscribe --channel <n> --subscriber <id>

Message:
  message publish    --channel <n> --from <id> --from-role <role> --content <msg>
                     [--to <id>] [--to-role <role>] [--reply-to <msgId>]
  message list       --channel <n> [--subscriber <id>] [--since <ISO>] [--limit <n>]
  message replies    --channel <n> --message-id <id>
  message wait-reply --channel <n> --message-id <id> [--timeout 60]
  message poll       --channel <n> --subscriber <id>

Worker:
  worker start  --id <entity-id>
  worker stop   --id <entity-id>
  worker status`);
}
