import type { StringTemplate } from './types.js';
import { Storage } from './storage.js';
import { TemplateRenderer } from './template-renderer.js';
import { EnclosureManager } from './enclosure-manager.js';

/**
 * 模版管理器
 * 负责模版的 CRUD 操作
 */
export class TemplateManager {
    private storage: Storage;
    private renderer: TemplateRenderer;
    private enclosureManager: EnclosureManager;
    private templates: Map<string, StringTemplate>;

    constructor(configDir?: string) {
        this.storage = new Storage(configDir);
        this.renderer = new TemplateRenderer();
        this.enclosureManager = new EnclosureManager(configDir);
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

    /**
     * 按围栏名称部分解析 encId 并渲染模版（模版含 {encId} 时）
     * @param keyOrQuery 模版 key 或名称关键词
     * @param encNamePart 围栏名称部分（如「防汛」匹配「上海防汛」）
     * @param variables 其他变量
     * @returns 渲染结果数组（匹配到多个围栏时返回多条）
     */
    renderWithEncName(
        keyOrQuery: string,
        encNamePart: string,
        variables: Record<string, string> = {}
    ): string[] {
        let template = this.get(keyOrQuery);
        if (!template) {
            const found = this.search(keyOrQuery);
            if (found.length === 0) throw new Error(`Template not found: ${keyOrQuery}`);
            if (found.length > 1) throw new Error(`Multiple templates match "${keyOrQuery}", use exact key`);
            template = found[0];
        }

        const needsEncId = template.variables.includes('encId');
        if (!needsEncId) {
            const out = this.renderer.render(template, variables);
            return [out];
        }

        const enclosures = this.enclosureManager.findByNamePart(encNamePart);
        if (enclosures.length === 0) {
            throw new Error(`未找到匹配的围栏: ${encNamePart}`);
        }

        return enclosures.map(enc => {
            const vars = { ...variables, encId: enc.id };
            return this.renderer.render(template!, vars);
        });
    }

    /**
     * 按 tag 搜索模版
     */
    searchByTag(tag: string): StringTemplate[] {
        return this.list().filter(t => (t.tags ?? []).includes(tag));
    }

    /**
     * 按 tag 查找模版，并用围栏名称解析 encId，返回所有模版的渲染结果（多条）
     */
    renderByTagAndEncName(
        tag: string,
        encNamePart: string,
        variables: Record<string, string> = {}
    ): string[] {
        const templates = this.searchByTag(tag);
        if (templates.length === 0) {
            throw new Error(`未找到 tag 为 "${tag}" 的模版`);
        }
        const results: string[] = [];
        for (const template of templates) {
            const rendered = this.renderWithEncName(template.key, encNamePart, variables);
            results.push(...rendered);
        }
        return results;
    }
}
