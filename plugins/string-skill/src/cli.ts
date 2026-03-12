#!/usr/bin/env node
import { Command } from 'commander';
import { TemplateManager } from './lib/template-manager.js';
import { TemplateRenderer } from './lib/template-renderer.js';
import type { StringTemplate } from './lib/types.js';

const program = new Command();
const manager = new TemplateManager();
const renderer = new TemplateRenderer();

program
    .name('string-skill')
    .description('字符串模版管理工具')
    .version('1.0.0');

program
    .command('add')
    .description('添加新的字符串模版')
    .argument('<key>', '模版唯一标识')
    .argument('<content>', '模版内容（支持 {variable} 格式）')
    .argument('<name>', '模版名称（中文描述）')
    .action((key: string, content: string, name: string) => {
        try {
            const template: StringTemplate = {
                key,
                name,
                content,
                variables: [],
            };
            manager.add(template);
            console.log(`add - 成功添加模版: ${name} (${key})`);

            const addedTemplate = manager.get(key);
            if (addedTemplate && addedTemplate.variables.length > 0) {
                console.log(`add - 检测到变量: ${addedTemplate.variables.join(', ')}`);
            }
        } catch (error) {
            console.error('add - 添加失败:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('update')
    .description('更新现有模版')
    .argument('<key>', '模版 key')
    .option('-c, --content <content>', '新的模版内容')
    .option('-n, --name <name>', '新的模版名称')
    .action((key: string, options: { content?: string; name?: string }) => {
        try {
            if (!options.content && !options.name) {
                console.error('update - 请至少提供 --content 或 --name 参数');
                process.exit(1);
            }

            const updates: Partial<Omit<StringTemplate, 'key'>> = {};
            if (options.content) updates.content = options.content;
            if (options.name) updates.name = options.name;

            manager.update(key, updates);
            console.log(`update - 成功更新模版: ${key}`);

            const updated = manager.get(key);
            if (updated && options.content && updated.variables.length > 0) {
                console.log(`update - 检测到变量: ${updated.variables.join(', ')}`);
            }
        } catch (error) {
            console.error('update - 更新失败:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('delete')
    .description('删除模版')
    .argument('<key>', '模版 key')
    .action((key: string) => {
        try {
            manager.delete(key);
            console.log(`delete - 成功删除模版: ${key}`);
        } catch (error) {
            console.error('delete - 删除失败:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('list')
    .description('列出所有模版')
    .action(() => {
        const templates = manager.list();

        if (templates.length === 0) {
            console.log('list - 暂无模版');
            return;
        }

        console.log(`\nlist - 共有 ${templates.length} 个模版:\n`);
        templates.forEach(template => {
            console.log(`  Key: ${template.key}`);
            console.log(`  名称: ${template.name}`);
            console.log(`  内容: ${template.content}`);
            if (template.variables.length > 0) {
                console.log(`  变量: ${template.variables.join(', ')}`);
            }
            console.log('');
        });
    });

program
    .command('render')
    .description('渲染模版并输出结果')
    .argument('<key-or-name>', '模版 key 或名称')
    .argument('[variables...]', '变量值（格式: key=value）')
    .action((keyOrName: string, variableArgs: string[]) => {
        try {
            let template = manager.get(keyOrName);

            if (!template) {
                const results = manager.search(keyOrName);
                if (results.length === 0) {
                    console.error(`render - 未找到模版: ${keyOrName}`);
                    process.exit(1);
                }
                if (results.length > 1) {
                    console.error(`render - 找到多个匹配的模版，请使用更精确的关键词:`);
                    results.forEach(t => console.error(`  - ${t.key} (${t.name})`));
                    process.exit(1);
                }
                template = results[0];
            }

            const variables: Record<string, string> = {};
            for (const arg of variableArgs) {
                const [key, ...valueParts] = arg.split('=');
                if (!key || valueParts.length === 0) {
                    console.error(`render - 变量格式错误: ${arg}，应该是 key=value 格式`);
                    process.exit(1);
                }
                variables[key] = valueParts.join('=');
            }

            const result = renderer.render(template, variables);
            console.log(result);
        } catch (error) {
            console.error('render - 渲染失败:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program.parse();
