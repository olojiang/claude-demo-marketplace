import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Storage } from './storage.js';
import type { StringTemplate } from './types.js';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

describe('Storage', () => {
    const testConfigDir = join(homedir(), '.string-skill-test-storage');
    const testConfigFile = join(testConfigDir, 'templates.json');

    beforeEach(() => {
        // 清理测试目录
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true });
        }
    });

    afterEach(() => {
        // 清理测试目录
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true, force: true });
        }
    });

    describe('load', () => {
        it('should return empty array when config file does not exist', () => {
            const storage = new Storage(testConfigDir);
            const templates = storage.load();
            expect(templates).toEqual([]);
        });

        it('should load templates from config file', () => {
            // 创建测试配置文件
            mkdirSync(testConfigDir, { recursive: true });
            const testTemplates: StringTemplate[] = [
                {
                    key: 'test1',
                    name: '测试1',
                    content: 'Hello {name}',
                    variables: ['name']
                }
            ];
            writeFileSync(testConfigFile, JSON.stringify({ templates: testTemplates }, null, 2));

            const storage = new Storage(testConfigDir);
            const templates = storage.load();
            expect(templates).toEqual(testTemplates);
        });

        it('should return empty array if config file is invalid JSON', () => {
            mkdirSync(testConfigDir, { recursive: true });
            writeFileSync(testConfigFile, 'invalid json');

            const storage = new Storage(testConfigDir);
            const templates = storage.load();
            expect(templates).toEqual([]);
        });
    });

    describe('save', () => {
        it('should save templates to config file', () => {
            const storage = new Storage(testConfigDir);
            const templates: StringTemplate[] = [
                {
                    key: 'test1',
                    name: '测试1',
                    content: 'Hello {name}',
                    variables: ['name']
                }
            ];

            storage.save(templates);

            // 验证文件已创建
            expect(existsSync(testConfigFile)).toBe(true);

            // 验证内容正确
            const loaded = storage.load();
            expect(loaded).toEqual(templates);
        });

        it('should create config directory if it does not exist', () => {
            const storage = new Storage(testConfigDir);
            const templates: StringTemplate[] = [];

            storage.save(templates);

            expect(existsSync(testConfigDir)).toBe(true);
        });
    });
});
