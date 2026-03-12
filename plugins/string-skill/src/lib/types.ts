/**
 * 字符串模版定义
 */
export interface StringTemplate {
    /** 模版唯一标识 */
    key: string;
    /** 模版名称（中文描述） */
    name: string;
    /** 模版内容，支持 {var} 格式变量 */
    content: string;
    /** 变量列表 */
    variables: string[];
}

/**
 * 模版配置文件结构
 */
export interface TemplateConfig {
    templates: StringTemplate[];
}

/**
 * 渲染选项
 */
export interface RenderOptions {
    /** 变量值映射 */
    variables?: Record<string, string>;
}
