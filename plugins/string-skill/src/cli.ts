#!/usr/bin/env node
import { Command } from 'commander';
import { TemplateManager } from './lib/template-manager.js';
import { TemplateRenderer } from './lib/template-renderer.js';
import { EnclosureManager } from './lib/enclosure-manager.js';
import type { StringTemplate } from './lib/types.js';

const configDir = process.env.STRING_SKILL_CONFIG_DIR;
const program = new Command();
const manager = new TemplateManager(configDir);
const renderer = new TemplateRenderer();
const enclosureManager = new EnclosureManager(configDir);

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
    .option('-t, --tags <tags>', '标签，逗号分隔（如 link,防汛）')
    .action((key: string, content: string, name: string, options: { tags?: string }) => {
        try {
            const template: StringTemplate = {
                key,
                name,
                content,
                variables: [],
                tags: options.tags ? options.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
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
    .option('-t, --tags <tags>', '标签，逗号分隔')
    .action((key: string, options: { content?: string; name?: string; tags?: string }) => {
        try {
            if (!options.content && !options.name && options.tags === undefined) {
                console.error('update - 请至少提供 --content、--name 或 --tags 参数');
                process.exit(1);
            }

            const updates: Partial<Omit<StringTemplate, 'key'>> = {};
            if (options.content) updates.content = options.content;
            if (options.name) updates.name = options.name;
            if (options.tags !== undefined) {
                updates.tags = options.tags ? options.tags.split(',').map(s => s.trim()).filter(Boolean) : [];
            }

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
            if (template.tags && template.tags.length > 0) {
                console.log(`  标签: ${template.tags.join(', ')}`);
            }
            console.log('');
        });
    });

program
    .command('render')
    .description('渲染模版并输出结果')
    .argument('<key-or-name>', '模版 key 或名称')
    .argument('[variables...]', '变量值（格式: key=value）')
    .option('-e, --enc <namePart>', '围栏名称部分，自动解析 encId（模版含 {encId} 时）')
    .option('--by-tag <tag>', '按 tag 查找模版并渲染（需配合 --enc 使用）')
    .action((keyOrName: string, variableArgs: string[], options: { enc?: string; byTag?: string }) => {
        try {
            const variables: Record<string, string> = {};
            for (const arg of variableArgs) {
                const [key, ...valueParts] = arg.split('=');
                if (!key || valueParts.length === 0) {
                    console.error(`render - 变量格式错误: ${arg}，应该是 key=value 格式`);
                    process.exit(1);
                }
                variables[key] = valueParts.join('=');
            }

            if (options.byTag) {
                if (!options.enc) {
                    console.error('render - 使用 --by-tag 时请同时指定 --enc <围栏名称部分>');
                    process.exit(1);
                }
                const results = manager.renderByTagAndEncName(options.byTag, options.enc, variables);
                results.forEach(r => console.log(r));
                return;
            }

            if (options.enc) {
                const results = manager.renderWithEncName(keyOrName, options.enc, variables);
                results.forEach(r => console.log(r));
                return;
            }

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

            const result = renderer.render(template, variables);
            console.log(result);
        } catch (error) {
            console.error('render - 渲染失败:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('enclosure')
    .description('围栏(enclosure) CRUD，维护 id-name 对供 encId 解析')
    .argument('<action>', 'add | list | delete | update')
    .argument('[id-or-name]', 'id 或名称（add 时为 name）')
    .argument('[id]', 'add 时的 id')
    .option('-n, --name <name>', 'update 时的新名称')
    .action((action: string, idOrName?: string, id?: string, options?: { name?: string }) => {
        try {
            switch (action) {
                case 'add':
                    if (!idOrName || !id) {
                        console.error('enclosure - add 用法: enclosure add <name> <id>');
                        process.exit(1);
                    }
                    enclosureManager.add({ id, name: idOrName });
                    console.log(`enclosure - 已添加: ${idOrName} (${id})`);
                    break;
                case 'list': {
                    const list = enclosureManager.list();
                    if (list.length === 0) {
                        console.log('enclosure - 暂无围栏（将使用内置默认列表）');
                        return;
                    }
                    console.log(`\nenclosure - 共 ${list.length} 个围栏:\n`);
                    list.forEach(e => console.log(`  ${e.name}: ${e.id}`));
                    break;
                }
                case 'delete':
                    if (!idOrName) {
                        console.error('enclosure - delete 用法: enclosure delete <id>');
                        process.exit(1);
                    }
                    enclosureManager.delete(idOrName);
                    console.log(`enclosure - 已删除: ${idOrName}`);
                    break;
                case 'update':
                    if (!idOrName || !options?.name) {
                        console.error('enclosure - update 用法: enclosure update <id> --name <新名称>');
                        process.exit(1);
                    }
                    enclosureManager.update(idOrName, { name: options.name });
                    console.log(`enclosure - 已更新: ${idOrName} -> ${options.name}`);
                    break;
                default:
                    console.error(`enclosure - 未知操作: ${action}，支持 add | list | delete | update`);
                    process.exit(1);
            }
        } catch (error) {
            console.error('enclosure - 失败:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program.parse();
