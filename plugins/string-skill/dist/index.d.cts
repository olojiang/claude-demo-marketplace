/**
 * 字符串模版定义
 */
interface StringTemplate {
    /** 模版唯一标识 */
    key: string;
    /** 模版名称（中文描述） */
    name: string;
    /** 模版内容，支持 {var} 格式变量 */
    content: string;
    /** 变量列表 */
    variables: string[];
    /** 标签列表，用于按 tag 筛选模版 */
    tags?: string[];
}
/**
 * 空间/园区围栏 {id, name} 对
 */
interface Enclosure {
    id: string;
    name: string;
}
/**
 * 围栏配置文件结构
 */
interface EnclosureConfig {
    enclosures: Enclosure[];
}
/**
 * 模版配置文件结构
 */
interface TemplateConfig {
    templates: StringTemplate[];
}
/**
 * 渲染选项
 */
interface RenderOptions {
    /** 变量值映射 */
    variables?: Record<string, string>;
}

/**
 * 模版管理器
 * 负责模版的 CRUD 操作
 */
declare class TemplateManager {
    private storage;
    private renderer;
    private enclosureManager;
    private templates;
    constructor(configDir?: string);
    /**
     * 从存储加载模版
     */
    private loadTemplates;
    /**
     * 保存模版到存储
     */
    private saveTemplates;
    /**
     * 添加模版
     * @param template 模版对象
     */
    add(template: StringTemplate): void;
    /**
     * 更新模版
     * @param key 模版 key
     * @param updates 更新内容
     */
    update(key: string, updates: Partial<Omit<StringTemplate, 'key'>>): void;
    /**
     * 删除模版
     * @param key 模版 key
     */
    delete(key: string): void;
    /**
     * 获取模版
     * @param key 模版 key
     * @returns 模版对象或 undefined
     */
    get(key: string): StringTemplate | undefined;
    /**
     * 列出所有模版
     * @returns 模版数组
     */
    list(): StringTemplate[];
    /**
     * 搜索模版
     * @param query 搜索关键词（匹配 key 或 name）
     * @returns 匹配的模版数组
     */
    search(query: string): StringTemplate[];
    /**
     * 按围栏名称部分解析 encId 并渲染模版（模版含 {encId} 时）
     * @param keyOrQuery 模版 key 或名称关键词
     * @param encNamePart 围栏名称部分（如「防汛」匹配「上海防汛」）
     * @param variables 其他变量
     * @returns 渲染结果数组（匹配到多个围栏时返回多条）
     */
    renderWithEncName(keyOrQuery: string, encNamePart: string, variables?: Record<string, string>): string[];
    /**
     * 按 tag 搜索模版
     */
    searchByTag(tag: string): StringTemplate[];
    /**
     * 按 tag 查找模版，并用围栏名称解析 encId，返回所有模版的渲染结果（多条）
     */
    renderByTagAndEncName(tag: string, encNamePart: string, variables?: Record<string, string>): string[];
}

/**
 * 模版渲染器
 * 负责提取变量和渲染模版
 */
declare class TemplateRenderer {
    /**
     * 从模版内容中提取变量名
     * @param content 模版内容
     * @returns 变量名数组
     */
    extractVariables(content: string): string[];
    /**
     * 渲染模版
     * @param template 模版对象
     * @param variables 变量值映射
     * @returns 渲染后的字符串
     */
    render(template: StringTemplate, variables: Record<string, string>): string;
}

/**
 * 存储管理器
 * 负责加载和保存模版配置
 */
declare class Storage {
    private configDir;
    private configFile;
    constructor(configDir?: string);
    /**
     * 加载模版配置
     * @returns 模版数组
     */
    load(): StringTemplate[];
    /**
     * 保存模版配置
     * @param templates 模版数组
     */
    save(templates: StringTemplate[]): void;
}

/**
 * 围栏存储
 * 负责加载和保存 enclosures.json
 */
declare class EnclosureStorage {
    private configDir;
    private enclosuresFile;
    constructor(configDir?: string);
    /**
     * 加载围栏列表，文件不存在时返回默认数据
     */
    load(): Enclosure[];
    /**
     * 保存围栏列表
     */
    save(enclosures: Enclosure[]): void;
}

/**
 * 围栏 CRUD 管理
 */
declare class EnclosureManager {
    private storage;
    private enclosures;
    constructor(configDir?: string);
    private loadEnclosures;
    private saveEnclosures;
    add(enclosure: Enclosure): void;
    update(id: string, updates: Partial<Pick<Enclosure, 'name'>>): void;
    delete(id: string): void;
    getById(id: string): Enclosure | undefined;
    list(): Enclosure[];
    /**
     * 按名称部分匹配（模糊、不区分大小写）
     */
    findByNamePart(namePart: string): Enclosure[];
}

export { type Enclosure, type EnclosureConfig, EnclosureManager, EnclosureStorage, type RenderOptions, Storage, type StringTemplate, type TemplateConfig, TemplateManager, TemplateRenderer };
