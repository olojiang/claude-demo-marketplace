import { describe, it, expect } from 'vitest';
import { useTestDir } from './test-helper.js';
import {
  createChannel, listChannels, getChannel, deleteChannel,
  subscribe, unsubscribe,
  publish, getMessages, getReplies, pendingFor, poll,
} from '../src/channel.js';

describe('channel lifecycle', () => {
  useTestDir();

  it('create channel with default memory type', () => {
    const ch = createChannel('test-ch');
    expect(ch.name).toBe('test-ch');
    expect(ch.type).toBe('memory');
    expect(ch.subscribers).toEqual([]);
  });

  it('list channels', () => {
    createChannel('ch-a');
    createChannel('ch-b');
    const list = listChannels();
    expect(list).toHaveLength(2);
    expect(list.map(c => c.name).sort()).toEqual(['ch-a', 'ch-b']);
  });

  it('get channel returns meta', () => {
    createChannel('my-ch');
    const ch = getChannel('my-ch');
    expect(ch).not.toBeNull();
    expect(ch.name).toBe('my-ch');
  });

  it('get nonexistent channel returns null', () => {
    expect(getChannel('nope')).toBeNull();
  });

  it('delete channel removes it', () => {
    createChannel('to-delete');
    expect(listChannels()).toHaveLength(1);
    const deleted = deleteChannel('to-delete');
    expect(deleted.name).toBe('to-delete');
    expect(listChannels()).toHaveLength(0);
  });
});

describe('subscription', () => {
  useTestDir();

  it('subscribe adds subscriber to channel', () => {
    createChannel('sub-ch');
    const meta = subscribe('sub-ch', 'user-1', 'person');
    expect(meta.subscribers).toHaveLength(1);
    expect(meta.subscribers[0].id).toBe('user-1');
    expect(meta.subscribers[0].role).toBe('person');
  });

  it('duplicate subscribe is idempotent', () => {
    createChannel('dup-ch');
    subscribe('dup-ch', 'user-1', 'person');
    subscribe('dup-ch', 'user-1', 'person');
    const ch = getChannel('dup-ch');
    expect(ch.subscribers).toHaveLength(1);
  });

  it('multiple subscribers', () => {
    createChannel('multi-ch');
    subscribe('multi-ch', 'person-1', 'person');
    subscribe('multi-ch', 'device-1', 'device');
    subscribe('multi-ch', 'agent-1', 'agent');
    const ch = getChannel('multi-ch');
    expect(ch.subscribers).toHaveLength(3);
  });

  it('unsubscribe removes subscriber', () => {
    createChannel('unsub-ch');
    subscribe('unsub-ch', 'user-1', 'person');
    subscribe('unsub-ch', 'user-2', 'person');
    unsubscribe('unsub-ch', 'user-1');
    const ch = getChannel('unsub-ch');
    expect(ch.subscribers).toHaveLength(1);
    expect(ch.subscribers[0].id).toBe('user-2');
  });

  it('subscribe to nonexistent channel throws', () => {
    expect(() => subscribe('no-ch', 'u1', 'person')).toThrow('channel not found');
  });
});

describe('messaging', () => {
  useTestDir();

  it('publish broadcast message (no target)', () => {
    createChannel('msg-ch');
    const msg = publish('msg-ch', {
      from: 'agent-1', fromRole: 'agent',
      content: 'Hello all',
    });
    expect(msg.id).toBeTruthy();
    expect(msg.to).toBeNull();
    expect(msg.content).toBe('Hello all');
    expect(msg.replyTo).toBeNull();
  });

  it('publish targeted message', () => {
    createChannel('target-ch');
    const msg = publish('target-ch', {
      from: 'agent-1', fromRole: 'agent',
      to: 'person-1', toRole: 'person',
      content: 'Hi person',
    });
    expect(msg.to).toEqual({ id: 'person-1', role: 'person' });
  });

  it('publish infers toRole from subscriber when omitted', () => {
    createChannel('infer-ch');
    subscribe('infer-ch', 'dev-1', 'device');
    const msg = publish('infer-ch', {
      from: 'agent-1', fromRole: 'agent',
      to: 'dev-1',
      content: 'read sensor',
    });
    expect(msg.to.role).toBe('device');
  });

  it('publish defaults toRole to agent for unknown subscriber', () => {
    createChannel('unknown-ch');
    const msg = publish('unknown-ch', {
      from: 'agent-1', fromRole: 'agent',
      to: 'unknown-id',
      content: 'hello',
    });
    expect(msg.to.role).toBe('agent');
  });

  it('getMessages returns all messages', () => {
    createChannel('gm-ch');
    publish('gm-ch', { from: 'a', fromRole: 'agent', content: 'msg1' });
    publish('gm-ch', { from: 'b', fromRole: 'person', content: 'msg2' });
    expect(getMessages('gm-ch')).toHaveLength(2);
  });

  it('getMessages filters by subscriber', () => {
    createChannel('filter-ch');
    publish('filter-ch', { from: 'a', fromRole: 'agent', content: 'broadcast' });
    publish('filter-ch', {
      from: 'a', fromRole: 'agent',
      to: 'p1', toRole: 'person', content: 'for p1',
    });
    publish('filter-ch', {
      from: 'a', fromRole: 'agent',
      to: 'p2', toRole: 'person', content: 'for p2',
    });
    const p1Msgs = getMessages('filter-ch', { subscriberId: 'p1' });
    expect(p1Msgs).toHaveLength(2);
    expect(p1Msgs.map(m => m.content)).toContain('broadcast');
    expect(p1Msgs.map(m => m.content)).toContain('for p1');
  });

  it('getMessages filters by limit', () => {
    createChannel('lim-ch');
    for (let i = 0; i < 5; i++) {
      publish('lim-ch', { from: 'a', fromRole: 'agent', content: `msg-${i}` });
    }
    const last2 = getMessages('lim-ch', { limit: 2 });
    expect(last2).toHaveLength(2);
    expect(last2[0].content).toBe('msg-3');
  });

  it('getReplies returns messages replying to a specific message', () => {
    createChannel('reply-ch');
    const original = publish('reply-ch', {
      from: 'agent-1', fromRole: 'agent',
      to: 'person-1', toRole: 'person',
      content: 'please reply',
    });
    publish('reply-ch', {
      from: 'person-1', fromRole: 'person',
      to: 'agent-1', toRole: 'agent',
      content: 'here is my reply',
      replyTo: original.id,
    });
    publish('reply-ch', {
      from: 'person-2', fromRole: 'person',
      content: 'unrelated message',
    });

    const replies = getReplies('reply-ch', original.id);
    expect(replies).toHaveLength(1);
    expect(replies[0].content).toBe('here is my reply');
  });

  it('publish to nonexistent channel throws', () => {
    expect(() => publish('ghost', {
      from: 'a', fromRole: 'agent', content: 'fail',
    })).toThrow('channel not found');
  });
});

describe('pendingFor', () => {
  useTestDir();

  it('returns messages targeted at entity with no reply yet', () => {
    createChannel('pf-ch');
    publish('pf-ch', {
      from: 'agent', fromRole: 'agent',
      to: 'person-1', toRole: 'person',
      content: 'task 1',
    });
    publish('pf-ch', {
      from: 'agent', fromRole: 'agent',
      to: 'person-1', toRole: 'person',
      content: 'task 2',
    });

    const pending = pendingFor('pf-ch', 'person-1');
    expect(pending).toHaveLength(2);
  });

  it('excludes messages already replied to', () => {
    createChannel('pf2-ch');
    const msg1 = publish('pf2-ch', {
      from: 'agent', fromRole: 'agent',
      to: 'person-1', toRole: 'person',
      content: 'task 1',
    });
    publish('pf2-ch', {
      from: 'agent', fromRole: 'agent',
      to: 'person-1', toRole: 'person',
      content: 'task 2',
    });
    publish('pf2-ch', {
      from: 'person-1', fromRole: 'person',
      to: 'agent', toRole: 'agent',
      content: 'done task 1',
      replyTo: msg1.id,
    });

    const pending = pendingFor('pf2-ch', 'person-1');
    expect(pending).toHaveLength(1);
    expect(pending[0].content).toBe('task 2');
  });

  it('ignores broadcast messages (no target)', () => {
    createChannel('pf3-ch');
    publish('pf3-ch', {
      from: 'agent', fromRole: 'agent', content: 'broadcast',
    });
    expect(pendingFor('pf3-ch', 'person-1')).toHaveLength(0);
  });

  it('ignores messages sent by the entity itself', () => {
    createChannel('pf4-ch');
    publish('pf4-ch', {
      from: 'person-1', fromRole: 'person',
      to: 'person-1', toRole: 'person',
      content: 'self-message',
    });
    expect(pendingFor('pf4-ch', 'person-1')).toHaveLength(0);
  });
});

describe('poll', () => {
  useTestDir();

  it('returns new messages and updates lastPollAt', async () => {
    createChannel('poll-ch');
    subscribe('poll-ch', 'sub-1', 'person');

    publish('poll-ch', { from: 'a', fromRole: 'agent', content: 'msg-1' });
    const first = poll('poll-ch', 'sub-1');
    expect(first).toHaveLength(1);

    await new Promise(r => setTimeout(r, 5));

    publish('poll-ch', { from: 'a', fromRole: 'agent', content: 'msg-2' });
    const second = poll('poll-ch', 'sub-1');
    expect(second).toHaveLength(1);
    expect(second[0].content).toBe('msg-2');
  });

  it('poll on nonexistent subscriber throws', () => {
    createChannel('poll-err');
    expect(() => poll('poll-err', 'ghost')).toThrow('subscriber not found');
  });
});
