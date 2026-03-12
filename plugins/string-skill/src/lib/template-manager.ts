import type { StringTemplate } from './types.js';
import { Storage } from './storage.js';
import { TemplateRenderer } from './template-renderer.js';

/**
 * 模版管理器
 * 负责模版的 CRUD 操作
 */
export class TemplateManager {
    private storage: Storage;
    private renderer: TemplateRenderer;
    private templates: Map<string, StringTemplate>;

    constructor(configDir?: string) {
        this.storage = new Storage(configDir);
        this.renderer = new TemplateRenderer();
        this.templates = new Map();
        this.loadTemplates();
    }

    /**
     * 从存储加载模版
     */
    private loadTemplates(): void {
        const templates = this.storage.load();
        this.templates.clear();
        for (const template of templates) {
            this.templates.set(template.key, template);
        }
    }

    /**
     * 保存模版到存储
     */
    private saveTemplates(): void {
        const templates = Array.from(this.templates.values());
        this.storage.save(templates);
    }

    /**
     * 添加模版
     * @param template 模版对象
     */
    add(template: StringTemplate): void {
        if (this.templates.has(template.key)) {
            throw new Error(`Template with key "${template.key}" already exists`);
        }

        // 自动提取变量
        const variables = this.renderer.extractVariables(template.content);
        const templateWithVars = { ...template, variables };

        this.templates.set(template.key, templateWithVars);
        this.saveTemplates();
    }

    /**
     * 更新模版
     * @param key 模版 key
     * @param updates 更新内容
     */
    update(key: string, updates: Partial<Omit<StringTemplate, 'key'>>): void {
        const template = this.templates.get(key);
        if (!template) {
            throw new Error(`Template with key "${key}" not found`);
        }

        const updated = { ...template, ...updates };

        // 如果内容更新了，重新提取变量
        if (updates.content !== undefined) {
            updated.variables = this.renderer.extractVariables(updated.content);
        }

        this.templates.set(key, updated);
        this.saveTemplates();
    }

    /**
     * 删除模版
     * @param key 模版 key
     */
    delete(key: string): void {
        if (!this.templates.has(key)) {
            throw new Error(`Template with key "${key}" not found`);
        }

        this.templates.delete(key);
        this.saveTemplates();
    }

    /**
     * 获取模版
     * @param key 模版 key
     * @returns 模版对象或 undefined
     */
    get(key: string): StringTemplate | undefined {
        return this.templates.get(key);
    }

    /**
     * 列出所有模版
     * @returns 模版数组
     */
    list(): StringTemplate[] {
        return Array.from(this.templates.values());
    }

    /**
     * 搜索模版
     * @param query 搜索关键词（匹配 key 或 name）
     * @returns 匹配的模版数组
     */
    search(query: string): StringTemplate[] {
        const lowerQuery = query.toLowerCase();
        return this.list().filter(template =>
            template.key.toLowerCase().includes(lowerQuery) ||
            template.name.toLowerCase().includes(lowerQuery)
        );
    }
}
