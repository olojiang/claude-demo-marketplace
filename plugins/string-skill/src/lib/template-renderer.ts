import type { StringTemplate } from './types.js';

/**
 * 模版渲染器
 * 负责提取变量和渲染模版
 */
export class TemplateRenderer {
    /**
     * 从模版内容中提取变量名
     * @param content 模版内容
     * @returns 变量名数组
     */
    extractVariables(content: string): string[] {
        const regex = /\{([^}]+)\}/g;
        const variables = new Set<string>();
        let match;

        while ((match = regex.exec(content)) !== null) {
            variables.add(match[1]);
        }

        return Array.from(variables);
    }

    /**
     * 渲染模版
     * @param template 模版对象
     * @param variables 变量值映射
     * @returns 渲染后的字符串
     */
    render(template: StringTemplate, variables: Record<string, string>): string {
        let result = template.content;

        // 检查必需变量
        for (const varName of template.variables) {
            if (!(varName in variables)) {
                throw new Error(`Missing required variable: ${varName}`);
            }
        }

        // 替换所有变量
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{${key}}`;
            result = result.replaceAll(placeholder, value);
        }

        return result;
    }
}
