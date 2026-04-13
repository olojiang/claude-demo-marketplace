import { join } from 'node:path';
import { rmSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { readJSON, writeJSON, ensureDir, getDataDir, listDirs } from './store.js';

function channelsDir() { return join(getDataDir(), 'channels'); }
function channelPath(name) { return join(channelsDir(), name); }
function metaPath(name) { return join(channelPath(name), 'meta.json'); }
function messagesPath(name) { return join(channelPath(name), 'messages.json'); }

export function createChannel(name, type = 'memory') {
  const dir = channelPath(name);
  ensureDir(dir);
  const meta = { name, type, subscribers: [], createdAt: new Date().toISOString() };
  writeJSON(metaPath(name), meta);
  writeJSON(messagesPath(name), []);
  return meta;
}

export function listChannels() {
  return listDirs(channelsDir())
    .map(name => readJSON(metaPath(name), null))
    .filter(Boolean);
}

export function getChannel(name) {
  return readJSON(metaPath(name), null);
}

export function deleteChannel(name) {
  const meta = getChannel(name);
  if (!meta) return null;
  rmSync(channelPath(name), { recursive: true, force: true });
  return meta;
}

export function subscribe(channelName, subscriberId, role) {
  const meta = readJSON(metaPath(channelName), null);
  if (!meta) throw new Error(`channel not found: ${channelName}`);

  if (meta.subscribers.find(s => s.id === subscriberId)) return meta;

  meta.subscribers.push({
    id: subscriberId,
    role,
    subscribedAt: new Date().toISOString(),
    lastPollAt: null,
  });
  writeJSON(metaPath(channelName), meta);
  return meta;
}

export function unsubscribe(channelName, subscriberId) {
  const meta = readJSON(metaPath(channelName), null);
  if (!meta) throw new Error(`channel not found: ${channelName}`);

  meta.subscribers = meta.subscribers.filter(s => s.id !== subscriberId);
  writeJSON(metaPath(channelName), meta);
  return meta;
}

export function publish(channelName, { from, fromRole, to, toRole, content, replyTo }) {
  const meta = readJSON(metaPath(channelName), null);
  if (!meta) throw new Error(`channel not found: ${channelName}`);

  let resolvedToRole = toRole;
  if (to && !resolvedToRole) {
    const sub = meta.subscribers.find(s => s.id === to);
    resolvedToRole = sub ? sub.role : 'agent';
  }

  const messages = readJSON(messagesPath(channelName), []);
  const msg = {
    id: randomUUID(),
    channel: channelName,
    from: { id: from, role: fromRole },
    to: to ? { id: to, role: resolvedToRole } : null,
    content,
    replyTo: replyTo || null,
    timestamp: new Date().toISOString(),
  };
  messages.push(msg);
  writeJSON(messagesPath(channelName), messages);
  return msg;
}

export function getMessages(channelName, { subscriberId, since, limit } = {}) {
  let messages = readJSON(messagesPath(channelName), []);

  if (subscriberId) {
    messages = messages.filter(m =>
      !m.to || m.to.id === subscriberId || m.from.id === subscriberId
    );
  }
  if (since) {
    const sinceDate = new Date(since);
    messages = messages.filter(m => new Date(m.timestamp) > sinceDate);
  }
  if (limit) {
    messages = messages.slice(-Number(limit));
  }
  return messages;
}

export function getReplies(channelName, messageId) {
  const messages = readJSON(messagesPath(channelName), []);
  return messages.filter(m => m.replyTo === messageId);
}

export function pendingFor(channelName, entityId) {
  const messages = readJSON(messagesPath(channelName), []);
  const incoming = messages.filter(m =>
    m.to && m.to.id === entityId && m.from.id !== entityId
  );
  const repliedToIds = new Set(
    messages
      .filter(m => m.from.id === entityId && m.replyTo)
      .map(m => m.replyTo)
  );
  return incoming.filter(m => !repliedToIds.has(m.id));
}

export function poll(channelName, subscriberId) {
  const meta = readJSON(metaPath(channelName), null);
  if (!meta) throw new Error(`channel not found: ${channelName}`);

  const sub = meta.subscribers.find(s => s.id === subscriberId);
  if (!sub) throw new Error(`subscriber not found in channel: ${subscriberId}`);

  const since = sub.lastPollAt || null;
  const messages = getMessages(channelName, { subscriberId, since });

  sub.lastPollAt = new Date().toISOString();
  writeJSON(metaPath(channelName), meta);

  return messages;
}
