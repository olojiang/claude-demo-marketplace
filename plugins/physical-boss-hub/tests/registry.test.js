import { describe, it, expect } from 'vitest';
import { useTestDir } from './test-helper.js';
import { register, listEntities, getEntity, removeEntity } from '../src/registry.js';

describe('device management', () => {
  useTestDir();

  it('register device with all fields', () => {
    const dev = register('device', {
      name: 'temp-sensor',
      description: 'Temperature sensor',
      tags: 'sensor,temperature',
      actions: 'read-temp,calibrate',
    });

    expect(dev.id).toBeTruthy();
    expect(dev.name).toBe('temp-sensor');
    expect(dev.description).toBe('Temperature sensor');
    expect(dev.tags).toEqual(['sensor', 'temperature']);
    expect(dev.actions).toEqual(['read-temp', 'calibrate']);
    expect(dev.type).toBe('device');
    expect(dev.createdAt).toBeTruthy();
  });

  it('list devices returns all registered', () => {
    register('device', { name: 'dev-a', tags: 'a' });
    register('device', { name: 'dev-b', tags: 'b' });

    const devices = listEntities('device');
    expect(devices).toHaveLength(2);
    expect(devices.map(d => d.name)).toEqual(['dev-a', 'dev-b']);
  });

  it('get device by full id', () => {
    const dev = register('device', { name: 'sensor-1' });
    const found = getEntity('device', dev.id);
    expect(found).not.toBeNull();
    expect(found.name).toBe('sensor-1');
  });

  it('get device by id prefix', () => {
    const dev = register('device', { name: 'sensor-2' });
    const prefix = dev.id.slice(0, 8);
    const found = getEntity('device', prefix);
    expect(found).not.toBeNull();
    expect(found.id).toBe(dev.id);
  });

  it('get nonexistent device returns null', () => {
    expect(getEntity('device', 'nonexistent')).toBeNull();
  });

  it('remove device by id', () => {
    const dev = register('device', { name: 'to-remove' });
    const removed = removeEntity('device', dev.id);
    expect(removed.name).toBe('to-remove');
    expect(listEntities('device')).toHaveLength(0);
  });

  it('remove nonexistent device returns null', () => {
    expect(removeEntity('device', 'no-such')).toBeNull();
  });

  it('tags and actions accept array input', () => {
    const dev = register('device', {
      name: 'arr-dev',
      tags: ['x', 'y'],
      actions: ['a1', 'a2'],
    });
    expect(dev.tags).toEqual(['x', 'y']);
    expect(dev.actions).toEqual(['a1', 'a2']);
  });

  it('empty tags and actions default to []', () => {
    const dev = register('device', { name: 'bare' });
    expect(dev.tags).toEqual([]);
    expect(dev.actions).toEqual([]);
    expect(dev.description).toBe('');
  });
});

describe('person management', () => {
  useTestDir();

  it('register person with all fields', () => {
    const p = register('person', {
      name: '韩啸',
      description: '空间智能机项目负责人',
      tags: '项目管理,技术报告',
      actions: 'write-daily-report,project-status',
    });

    expect(p.id).toBeTruthy();
    expect(p.name).toBe('韩啸');
    expect(p.type).toBe('person');
    expect(p.tags).toEqual(['项目管理', '技术报告']);
    expect(p.actions).toEqual(['write-daily-report', 'project-status']);
  });

  it('list persons returns all registered', () => {
    register('person', { name: 'Alice' });
    register('person', { name: 'Bob' });
    register('person', { name: 'Charlie' });

    expect(listEntities('person')).toHaveLength(3);
  });

  it('get person by id prefix', () => {
    const p = register('person', { name: 'Diana' });
    const found = getEntity('person', p.id.slice(0, 6));
    expect(found.name).toBe('Diana');
  });

  it('remove person', () => {
    const p = register('person', { name: 'Eve' });
    register('person', { name: 'Frank' });

    removeEntity('person', p.id);
    const remaining = listEntities('person');
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Frank');
  });

  it('device and person registries are independent', () => {
    register('device', { name: 'sensor' });
    register('person', { name: 'Alice' });

    expect(listEntities('device')).toHaveLength(1);
    expect(listEntities('person')).toHaveLength(1);
    expect(getEntity('device', 'nonexistent')).toBeNull();
  });
});
