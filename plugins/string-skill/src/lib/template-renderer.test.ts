import { describe, it, expect } from 'vitest';
import { TemplateRenderer } from './template-renderer.js';
import type { StringTemplate } from './types.js';

describe('TemplateRenderer', () => {
    describe('extractVariables', () => {
        it('should extract no variables from plain text', () => {
            const renderer = new TemplateRenderer();
            const variables = renderer.extractVariables('pnpm create @pinefield/webapp --template vue');
            expect(variables).toEqual([]);
        });

        it('should extract single variable', () => {
            const renderer = new TemplateRenderer();
            const variables = renderer.extractVariables('Hello {name}!');
            expect(variables).toEqual(['name']);
        });

        it('should extract multiple variables', () => {
            const renderer = new TemplateRenderer();
            const variables = renderer.extractVariables('https://test.com/?encId={encId}&userId={userId}');
            expect(variables).toEqual(['encId', 'userId']);
        });

        it('should extract duplicate variables only once', () => {
            const renderer = new TemplateRenderer();
            const variables = renderer.extractVariables('{name} says hello to {name}');
            expect(variables).toEqual(['name']);
        });

        it('should handle empty string', () => {
            const renderer = new TemplateRenderer();
            const variables = renderer.extractVariables('');
            expect(variables).toEqual([]);
        });
    });

    describe('render', () => {
        it('should render template without variables', () => {
            const renderer = new TemplateRenderer();
            const template: StringTemplate = {
                key: 'create-app',
                name: '创建应用',
                content: 'pnpm create @pinefield/webapp --template vue',
                variables: []
            };
            const result = renderer.render(template, {});
            expect(result).toBe('pnpm create @pinefield/webapp --template vue');
        });

        it('should render template with single variable', () => {
            const renderer = new TemplateRenderer();
            const template: StringTemplate = {
                key: 'greeting',
                name: '问候',
                content: 'Hello {name}!',
                variables: ['name']
            };
            const result = renderer.render(template, { name: 'Hunter' });
            expect(result).toBe('Hello Hunter!');
        });

        it('should render template with multiple variables', () => {
            const renderer = new TemplateRenderer();
            const template: StringTemplate = {
                key: 'spacetop',
                name: 'spacetop 链接',
                content: 'https://test.sheepwall.com/files/webapp/pinefield.spacetop/?encId={encId}&userId={userId}',
                variables: ['encId', 'userId']
            };
            const result = renderer.render(template, { encId: 'abc123', userId: 'user456' });
            expect(result).toBe('https://test.sheepwall.com/files/webapp/pinefield.spacetop/?encId=abc123&userId=user456');
        });

        it('should throw error if required variable is missing', () => {
            const renderer = new TemplateRenderer();
            const template: StringTemplate = {
                key: 'greeting',
                name: '问候',
                content: 'Hello {name}!',
                variables: ['name']
            };
            expect(() => renderer.render(template, {})).toThrow('Missing required variable: name');
        });

        it('should handle duplicate variable placeholders', () => {
            const renderer = new TemplateRenderer();
            const template: StringTemplate = {
                key: 'repeat',
                name: '重复',
                content: '{name} says hello to {name}',
                variables: ['name']
            };
            const result = renderer.render(template, { name: 'Alice' });
            expect(result).toBe('Alice says hello to Alice');
        });
    });
});
