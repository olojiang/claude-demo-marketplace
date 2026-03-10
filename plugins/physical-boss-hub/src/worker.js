#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { getEntity } from './registry.js';
import {
  listChannels, createChannel, subscribe, pendingFor, publish,
} from './channel.js';

const POLL_INTERVAL_MS = 3000;
const DEFAULT_CHANNEL = 'hub';

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  return (idx !== -1 && idx + 1 < process.argv.length)
    ? process.argv[idx + 1] : undefined;
}

const entityId = getArg('id');
if (!entityId) {
  console.error('worker: --id required');
  process.exit(1);
}

const entity = getEntity('person', entityId) || getEntity('device', entityId);
if (!entity) {
  console.error(`worker: entity not found: ${entityId}`);
  process.exit(1);
}

console.log(`worker main starting ${entity.type} "${entity.name}" (${entity.id})`);

ensureDefaultChannel();

function ensureDefaultChannel() {
  const channels = listChannels();
  if (!channels.find(c => c.name === DEFAULT_CHANNEL)) {
    createChannel(DEFAULT_CHANNEL, 'memory');
    console.log(`worker ensureDefaultChannel created "${DEFAULT_CHANNEL}"`);
  }
  subscribe(DEFAULT_CHANNEL, entity.id, entity.type);
  console.log(`worker ensureDefaultChannel subscribed to "${DEFAULT_CHANNEL}"`);
}

function buildPrompt(msg) {
  if (entity.type === 'person') {
    return [
      `你是 ${entity.name}。`,
      `角色描述：${entity.description}`,
      `技能标签：${entity.tags.join(', ')}`,
      `能力范围：${entity.actions.join(', ')}`,
      '',
      '你收到了以下消息/任务：',
      `"${msg.content}"`,
      '',
      `请以 ${entity.name} 的身份，根据你的角色和能力，认真完成这个任务并回复。`,
    ].join('\n');
  }
  return [
    `你是设备 ${entity.name}。`,
    `设备描述：${entity.description}`,
    `设备功能：${entity.actions.join(', ')}`,
    '',
    '你收到了以下指令：',
    `"${msg.content}"`,
    '',
    '请以该设备的身份回复数据。如果适用，请使用 JSON 格式输出。',
  ].join('\n');
}

function processMessage(msg) {
  const shortId = msg.id.slice(0, 8);
  console.log(`worker processMessage [${shortId}] from ${msg.from.role}:${msg.from.id.slice(0, 8)}`);

  const prompt = buildPrompt(msg);
  try {
    const response = execSync('claude -p', {
      input: prompt,
      encoding: 'utf-8',
      timeout: 120_000,
    }).trim();
    console.log(`worker processMessage [${shortId}] response ${response.length} chars`);
    return response;
  } catch {
    console.log(`worker processMessage [${shortId}] claude -p failed, using fallback`);
    return fallbackResponse(msg);
  }
}

function fallbackResponse(msg) {
  const snippet = msg.content.slice(0, 60);
  if (entity.type === 'person') {
    return `[${entity.name}] 已完成任务："${snippet}"。（模拟回复）`;
  }
  return JSON.stringify({
    device: entity.name,
    status: 'ok',
    message: `processed: ${snippet}`,
  });
}

const timer = setInterval(() => {
  const channels = listChannels();
  for (const ch of channels) {
    const pending = pendingFor(ch.name, entity.id);
    for (const msg of pending) {
      const reply = processMessage(msg);
      publish(ch.name, {
        from: entity.id,
        fromRole: entity.type,
        to: msg.from.id,
        toRole: msg.from.role,
        content: reply,
        replyTo: msg.id,
      });
      console.log(`worker main replied [${msg.id.slice(0, 8)}] in "${ch.name}"`);
    }
  }
}, POLL_INTERVAL_MS);

function cleanup() {
  console.log(`worker cleanup ${entity.name} shutting down...`);
  clearInterval(timer);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log(`worker main running (poll every ${POLL_INTERVAL_MS}ms)`);
