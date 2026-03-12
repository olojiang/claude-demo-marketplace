import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { StringTemplate, TemplateConfig } from './types.js';

/**
 * 存储管理器
 * 负责加载和保存模版配置
 */
export class Storage {
    private configDir: string;
    private configFile: string;

    constructor(configDir?: string) {
        this.configDir = configDir || join(homedir(), '.string-skill');
        this.configFile = join(this.configDir, 'templates.json');
    }

    /**
     * 加载模版配置
     * @returns 模版数组
     */
    load(): StringTemplate[] {
        try {
            if (!existsSync(this.configFile)) {
                return [];
            }

            const content = readFileSync(this.configFile, 'utf-8');
            const config: TemplateConfig = JSON.parse(content);
            return config.templates || [];
        } catch (error) {
            console.error('Failed to load templates:', error);
            return [];
        }
    }

    /**
     * 保存模版配置
     * @param templates 模版数组
     */
    save(templates: StringTemplate[]): void {
        try {
            // 确保目录存在
            if (!existsSync(this.configDir)) {
                mkdirSync(this.configDir, { recursive: true });
            }

            const config: TemplateConfig = { templates };
            writeFileSync(this.configFile, JSON.stringify(config, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save templates:', error);
            throw error;
        }
    }
}
