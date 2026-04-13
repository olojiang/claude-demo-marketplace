import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnclosureManager } from './enclosure-manager.js';
import type { Enclosure } from './types.js';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('EnclosureManager', () => {
    const testConfigDir = join(tmpdir(), '.string-skill-test-enclosure-manager');
    let manager: EnclosureManager;

    beforeEach(() => {
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true });
        }
        manager = new EnclosureManager(testConfigDir);
    });

    afterEach(() => {
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true, force: true });
        }
    });

    describe('add', () => {
        it('should add new enclosure', () => {
            manager.add({ id: 'enc1', name: '测试围栏' });
            expect(manager.getById('enc1')).toEqual({ id: 'enc1', name: '测试围栏' });
        });

        it('should throw when id already exists', () => {
            manager.add({ id: 'enc1', name: 'A' });
            expect(() => manager.add({ id: 'enc1', name: 'B' }))
                .toThrow('Enclosure with id "enc1" already exists');
        });
    });

    describe('update', () => {
        it('should update enclosure name by id', () => {
            manager.add({ id: 'enc1', name: '旧名称' });
            manager.update('enc1', { name: '新名称' });
            expect(manager.getById('enc1')?.name).toBe('新名称');
        });

        it('should throw when id not found', () => {
            expect(() => manager.update('nonexistent', { name: 'x' }))
                .toThrow('Enclosure with id "nonexistent" not found');
        });
    });

    describe('delete', () => {
        it('should delete enclosure by id', () => {
            manager.add({ id: 'enc1', name: '测试' });
            manager.delete('enc1');
            expect(manager.getById('enc1')).toBeUndefined();
        });

        it('should throw when id not found', () => {
            expect(() => manager.delete('nonexistent'))
                .toThrow('Enclosure with id "nonexistent" not found');
        });
    });

    describe('getById', () => {
        it('should return enclosure by id', () => {
            manager.add({ id: 'enc1', name: '测试' });
            expect(manager.getById('enc1')).toEqual({ id: 'enc1', name: '测试' });
        });

        it('should return undefined when not found', () => {
            expect(manager.getById('x')).toBeUndefined();
        });
    });

    describe('list', () => {
        it('should return all enclosures including defaults', () => {
            const list = manager.list();
            expect(list.length).toBeGreaterThan(0);
        });

        it('should include newly added enclosure', () => {
            manager.add({ id: 'custom1', name: '自定义' });
            const list = manager.list();
            expect(list.some(e => e.id === 'custom1')).toBe(true);
        });
    });

    describe('findByNamePart', () => {
        it('should find by partial name (default 上海防汛)', () => {
            const found = manager.findByNamePart('防汛');
            expect(found.length).toBeGreaterThanOrEqual(1);
            expect(found.some(e => e.name === '上海防汛')).toBe(true);
        });

        it('should find match by full name (default 进博会)', () => {
            const found = manager.findByNamePart('进博会');
            expect(found.length).toBeGreaterThanOrEqual(1);
            expect(found.some(e => e.name === '进博会')).toBe(true);
        });

        it('should return empty when no match', () => {
            const found = manager.findByNamePart('不存在的名字xyz');
            expect(found).toEqual([]);
        });

        it('should be case insensitive for ascii', () => {
            const found = manager.findByNamePart('DEMO');
            expect(found.length).toBeGreaterThanOrEqual(1);
            expect(found.some(e => e.name === '养老 demo')).toBe(true);
        });
    });
});
