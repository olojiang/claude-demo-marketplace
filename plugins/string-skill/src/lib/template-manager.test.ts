import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TemplateManager } from './template-manager.js';
import type { StringTemplate } from './types.js';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

describe('TemplateManager', () => {
    const testConfigDir = join(homedir(), '.string-skill-test-manager');
    let manager: TemplateManager;

    beforeEach(() => {
        // 清理测试目录
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true });
        }
        manager = new TemplateManager(testConfigDir);
    });

    afterEach(() => {
        // 清理测试目录
        if (existsSync(testConfigDir)) {
            rmSync(testConfigDir, { recursive: true, force: true });
        }
    });

    describe('add', () => {
        it('should add a new template', () => {
            const template: StringTemplate = {
                key: 'create-app',
                name: '创建应用',
                content: 'pnpm create @pinefield/webapp --template vue',
                variables: []
            };

            manager.add(template);
            const result = manager.get('create-app');
            expect(result).toEqual(template);
        });

        it('should throw error if template key already exists', () => {
            const template: StringTemplate = {
                key: 'test',
                name: '测试',
                content: 'test',
                variables: []
            };

            manager.add(template);
            expect(() => manager.add(template)).toThrow('Template with key "test" already exists');
        });

        it('should automatically extract variables when adding template', () => {
            const template: StringTemplate = {
                key: 'spacetop',
                name: 'spacetop 链接',
                content: 'https://test.sheepwall.com/?encId={encId}',
                variables: [] // 用户可能不提供，应自动提取
            };

            manager.add(template);
            const result = manager.get('spacetop');
            expect(result?.variables).toEqual(['encId']);
        });
    });

    describe('update', () => {
        it('should update existing template', () => {
            const template: StringTemplate = {
                key: 'test',
                name: '测试',
                content: 'original',
                variables: []
            };

            manager.add(template);
            manager.update('test', { content: 'updated', name: '更新测试' });

            const result = manager.get('test');
            expect(result?.content).toBe('updated');
            expect(result?.name).toBe('更新测试');
        });

        it('should throw error if template does not exist', () => {
            expect(() => manager.update('nonexistent', { content: 'test' }))
                .toThrow('Template with key "nonexistent" not found');
        });

        it('should re-extract variables when content is updated', () => {
            const template: StringTemplate = {
                key: 'test',
                name: '测试',
                content: 'Hello',
                variables: []
            };

            manager.add(template);
            manager.update('test', { content: 'Hello {name}' });

            const result = manager.get('test');
            expect(result?.variables).toEqual(['name']);
        });
    });

    describe('delete', () => {
        it('should delete existing template', () => {
            const template: StringTemplate = {
                key: 'test',
                name: '测试',
                content: 'test',
                variables: []
            };

            manager.add(template);
            manager.delete('test');

            expect(manager.get('test')).toBeUndefined();
        });

        it('should throw error if template does not exist', () => {
            expect(() => manager.delete('nonexistent'))
                .toThrow('Template with key "nonexistent" not found');
        });
    });

    describe('list', () => {
        it('should return empty array when no templates exist', () => {
            expect(manager.list()).toEqual([]);
        });

        it('should return all templates', () => {
            const template1: StringTemplate = {
                key: 'test1',
                name: '测试1',
                content: 'content1',
                variables: []
            };
            const template2: StringTemplate = {
                key: 'test2',
                name: '测试2',
                content: 'content2',
                variables: []
            };

            manager.add(template1);
            manager.add(template2);

            const result = manager.list();
            expect(result).toHaveLength(2);
            expect(result).toContainEqual(template1);
            expect(result).toContainEqual(template2);
        });
    });

    describe('get', () => {
        it('should return template by key', () => {
            const template: StringTemplate = {
                key: 'test',
                name: '测试',
                content: 'content',
                variables: []
            };

            manager.add(template);
            expect(manager.get('test')).toEqual(template);
        });

        it('should return undefined if template does not exist', () => {
            expect(manager.get('nonexistent')).toBeUndefined();
        });
    });

    describe('search', () => {
        beforeEach(() => {
            manager.add({
                key: 'create-app',
                name: '创建应用',
                content: 'pnpm create app',
                variables: []
            });
            manager.add({
                key: 'spacetop',
                name: 'spacetop 链接',
                content: 'https://test.com',
                variables: []
            });
        });

        it('should find template by exact key match', () => {
            const results = manager.search('create-app');
            expect(results).toHaveLength(1);
            expect(results[0].key).toBe('create-app');
        });

        it('should find template by partial key match', () => {
            const results = manager.search('create');
            expect(results).toHaveLength(1);
            expect(results[0].key).toBe('create-app');
        });

        it('should find template by name match', () => {
            const results = manager.search('应用');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('创建应用');
        });

        it('should find template by partial name match', () => {
            const results = manager.search('spacetop');
            expect(results).toHaveLength(1);
            expect(results[0].key).toBe('spacetop');
        });

        it('should return empty array if no match found', () => {
            const results = manager.search('nonexistent');
            expect(results).toEqual([]);
        });

        it('should be case insensitive', () => {
            const results = manager.search('SPACETOP');
            expect(results).toHaveLength(1);
        });
    });
});
