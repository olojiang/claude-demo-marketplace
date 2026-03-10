import { describe, it, expect } from 'vitest';
import { useTestDir } from './test-helper.js';
import { register, listEntities, getEntity } from '../src/registry.js';
import {
  createChannel, subscribe, publish, getReplies, pendingFor,
} from '../src/channel.js';

const HUB = 'hub';
const AGENT_ID = 'agent-main';

function setupHub() {
  createChannel(HUB, 'memory');
  subscribe(HUB, AGENT_ID, 'agent');
}

function findCapablePerson(actionKeyword) {
  const persons = listEntities('person');
  return persons.find(p =>
    p.actions.some(a => a.includes(actionKeyword))
    || p.tags.some(t => t.includes(actionKeyword))
    || p.description.includes(actionKeyword)
  ) || null;
}

function findCapableDevice(actionKeyword) {
  const devices = listEntities('device');
  return devices.find(d =>
    d.actions.some(a => a.includes(actionKeyword))
    || d.tags.some(t => t.includes(actionKeyword))
    || d.description.includes(actionKeyword)
  ) || null;
}

function delegateToEntity(entity, taskContent) {
  const msg = publish(HUB, {
    from: AGENT_ID, fromRole: 'agent',
    to: entity.id, toRole: entity.type,
    content: taskContent,
  });
  return msg;
}

function simulateWorkerReply(entity, originalMsgId, replyContent) {
  return publish(HUB, {
    from: entity.id, fromRole: entity.type,
    to: AGENT_ID, toRole: 'agent',
    content: replyContent,
    replyTo: originalMsgId,
  });
}

describe('scenario: person delegation - daily report', () => {
  useTestDir();

  it('agent finds person, delegates, receives reply', () => {
    setupHub();

    const hanxiao = register('person', {
      name: '韩啸',
      description: '空间智能机项目负责人，擅长撰写技术日报和项目进展报告',
      tags: '空间智能机,项目管理,技术报告',
      actions: 'write-daily-report,write-weekly-summary,project-status',
    });
    subscribe(HUB, hanxiao.id, 'person');

    const match = findCapablePerson('daily-report');
    expect(match).not.toBeNull();
    expect(match.name).toBe('韩啸');

    const taskMsg = delegateToEntity(match, '请撰写今日空间智能机项目的日报');
    expect(taskMsg.to.id).toBe(hanxiao.id);

    const pending = pendingFor(HUB, hanxiao.id);
    expect(pending).toHaveLength(1);
    expect(pending[0].content).toContain('日报');

    const dailyReport = '## 今日日报\n- 完成了通信模块开发\n- 测试覆盖率提升至 85%';
    simulateWorkerReply(hanxiao, taskMsg.id, dailyReport);

    const replies = getReplies(HUB, taskMsg.id);
    expect(replies).toHaveLength(1);
    expect(replies[0].content).toContain('日报');
    expect(replies[0].from.id).toBe(hanxiao.id);
    expect(replies[0].from.role).toBe('person');
    expect(replies[0].replyTo).toBe(taskMsg.id);

    expect(pendingFor(HUB, hanxiao.id)).toHaveLength(0);
  });
});

describe('scenario: device delegation - sensor data', () => {
  useTestDir();

  it('agent finds device, delegates, receives data reply', () => {
    setupHub();

    const sensor = register('device', {
      name: 'temp-sensor-01',
      description: '办公室温度传感器',
      tags: '传感器,温度,办公室',
      actions: 'read-temperature,calibrate',
    });
    subscribe(HUB, sensor.id, 'device');

    const match = findCapableDevice('temperature');
    expect(match).not.toBeNull();
    expect(match.name).toBe('temp-sensor-01');

    const cmd = delegateToEntity(match, '读取当前温度');

    const pending = pendingFor(HUB, sensor.id);
    expect(pending).toHaveLength(1);

    const dataReply = JSON.stringify({ temperature: 23.5, unit: 'celsius', timestamp: Date.now() });
    simulateWorkerReply(sensor, cmd.id, dataReply);

    const replies = getReplies(HUB, cmd.id);
    expect(replies).toHaveLength(1);
    const data = JSON.parse(replies[0].content);
    expect(data.temperature).toBe(23.5);
    expect(replies[0].from.role).toBe('device');
  });
});

describe('scenario: multi-entity selection', () => {
  useTestDir();

  it('agent selects correct entity among multiple', () => {
    setupHub();

    register('person', {
      name: 'Alice',
      description: 'Frontend developer',
      tags: 'frontend,react',
      actions: 'code-review,ui-design',
    });
    const bob = register('person', {
      name: 'Bob',
      description: 'Backend developer, handles API and database',
      tags: 'backend,api,database',
      actions: 'write-api,db-migration,performance-tuning',
    });

    const apiMatch = findCapablePerson('api');
    expect(apiMatch).not.toBeNull();
    expect(apiMatch.name).toBe('Bob');

    const uiMatch = findCapablePerson('ui-design');
    expect(uiMatch).not.toBeNull();
    expect(uiMatch.name).toBe('Alice');

    const noMatch = findCapablePerson('machine-learning');
    expect(noMatch).toBeNull();
  });
});

describe('scenario: full chain - multiple tasks', () => {
  useTestDir();

  it('agent delegates two tasks to different entities, both reply', () => {
    setupHub();

    const reporter = register('person', {
      name: '韩啸',
      description: '项目负责人',
      tags: '项目管理',
      actions: 'write-daily-report',
    });
    const monitor = register('device', {
      name: 'server-monitor',
      description: '服务器监控',
      tags: '监控,服务器',
      actions: 'read-cpu,read-memory',
    });
    subscribe(HUB, reporter.id, 'person');
    subscribe(HUB, monitor.id, 'device');

    const task1 = delegateToEntity(reporter, '撰写日报');
    const task2 = delegateToEntity(monitor, '读取 CPU 使用率');

    expect(pendingFor(HUB, reporter.id)).toHaveLength(1);
    expect(pendingFor(HUB, monitor.id)).toHaveLength(1);

    simulateWorkerReply(reporter, task1.id, '日报内容：一切正常');
    simulateWorkerReply(monitor, task2.id, '{"cpu": 42.5}');

    expect(getReplies(HUB, task1.id)).toHaveLength(1);
    expect(getReplies(HUB, task2.id)).toHaveLength(1);

    expect(pendingFor(HUB, reporter.id)).toHaveLength(0);
    expect(pendingFor(HUB, monitor.id)).toHaveLength(0);
  });
});

describe('scenario: reply chain integrity', () => {
  useTestDir();

  it('reply correctly references original message via replyTo', () => {
    setupHub();
    const p = register('person', { name: 'Test', actions: 'test-action' });
    subscribe(HUB, p.id, 'person');

    const orig = delegateToEntity(p, 'do something');
    const reply = simulateWorkerReply(p, orig.id, 'done');

    expect(reply.replyTo).toBe(orig.id);
    expect(reply.to.id).toBe(AGENT_ID);
    expect(reply.from.id).toBe(p.id);

    const entity = getEntity('person', p.id);
    expect(entity.name).toBe('Test');
  });
});
