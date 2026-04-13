import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnclosureStorage } from './enclosure-storage.js';
import type { Enclosure } from './types.js';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('EnclosureStorage', () => {
    const testConfigDir = join(tmpdir(), '.string-skill-test-enclosure-storage');
    const testEnclosuresFile = join(testConfigDir, 'enclosures.json');

    beforeEach(() => {
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true });
        }
    });

    afterEach(() => {
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true, force: true });
        }
    });

    describe('load', () => {
        it('should return default enclosures when file does not exist', () => {
            const storage = new EnclosureStorage(testConfigDir);
            const enclosures = storage.load();
            expect(enclosures.length).toBeGreaterThan(0);
            expect(enclosures.some(e => e.name === '进博会' && e.id === '6fM8Y6KTl5oAj1rv00lZmI')).toBe(true);
        });

        it('should load enclosures from file when file exists', () => {
            mkdirSync(testConfigDir, { recursive: true });
            const data: Enclosure[] = [
                { id: 'id1', name: '测试围栏1' },
                { id: 'id2', name: '测试围栏2' },
            ];
            writeFileSync(testEnclosuresFile, JSON.stringify({ enclosures: data }, null, 2));

            const storage = new EnclosureStorage(testConfigDir);
            const enclosures = storage.load();
            expect(enclosures).toEqual(data);
        });

        it('should return default when file is invalid JSON', () => {
            mkdirSync(testConfigDir, { recursive: true });
            writeFileSync(testEnclosuresFile, 'invalid json');

            const storage = new EnclosureStorage(testConfigDir);
            const enclosures = storage.load();
            expect(enclosures.length).toBeGreaterThan(0);
        });
    });

    describe('save', () => {
        it('should save enclosures to file', () => {
            const storage = new EnclosureStorage(testConfigDir);
            const data: Enclosure[] = [
                { id: 'id1', name: '保存测试1' },
                { id: 'id2', name: '保存测试2' },
            ];

            storage.save(data);

            expect(existsSync(testEnclosuresFile)).toBe(true);
            const loaded = storage.load();
            expect(loaded).toEqual(data);
        });

        it('should create config directory if it does not exist', () => {
            const storage = new EnclosureStorage(testConfigDir);
            storage.save([{ id: 'x', name: 'x' }]);
            expect(existsSync(testConfigDir)).toBe(true);
        });
    });
});
