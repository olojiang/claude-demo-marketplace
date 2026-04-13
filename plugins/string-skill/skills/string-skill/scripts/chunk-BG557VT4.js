// src/lib/storage.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
var Storage = class {
  constructor(configDir) {
    this.configDir = configDir || join(homedir(), ".string-skill");
    this.configFile = join(this.configDir, "templates.json");
  }
  /**
   * 加载模版配置
   * @returns 模版数组
   */
  load() {
    try {
      if (!existsSync(this.configFile)) {
        return [];
      }
      const content = readFileSync(this.configFile, "utf-8");
      const config = JSON.parse(content);
      return config.templates || [];
    } catch (error) {
      console.error("Failed to load templates:", error);
      return [];
    }
  }
  /**
   * 保存模版配置
   * @param templates 模版数组
   */
  save(templates) {
    try {
      if (!existsSync(this.configDir)) {
        mkdirSync(this.configDir, { recursive: true });
      }
      const config = { templates };
      writeFileSync(this.configFile, JSON.stringify(config, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save templates:", error);
      throw error;
    }
  }
};

// src/lib/template-renderer.ts
var TemplateRenderer = class {
  /**
   * 从模版内容中提取变量名
   * @param content 模版内容
   * @returns 变量名数组
   */
  extractVariables(content) {
    const regex = /\{([^}]+)\}/g;
    const variables = /* @__PURE__ */ new Set();
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
  render(template, variables) {
    let result = template.content;
    for (const varName of template.variables) {
      if (!(varName in variables)) {
        throw new Error(`Missing required variable: ${varName}`);
      }
    }
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      result = result.replaceAll(placeholder, value);
    }
    return result;
  }
};

// src/lib/enclosure-storage.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "fs";
import { join as join2 } from "path";
import { homedir as homedir2 } from "os";

// src/lib/default-enclosures.ts
var DEFAULT_ENCLOSURES = [
  { id: "6fM8Y6KTl5oAj1rv00lZmI", name: "\u8FDB\u535A\u4F1A" },
  { id: "3gGHgg1YEP8Eln8K0htraa", name: "\u4E1C\u65B9\u67A2\u7EBD" },
  { id: "LinGangA7ZCrBAsIcWeqUN", name: "\u6F15\u6CB3\u6CFE\u4E34\u6E2F" },
  { id: "2rIUpp4ke2v4mUvqQhHyQ5", name: "\u6F15\u6CB3\u6CFE\u6570\u5B57\u539F\u4F4D" },
  { id: "2fb22820cd654d2a9ba308b930ff3544", name: "\u517B\u8001 demo" },
  { id: "1TjZK6lSPqhrkENzm02TB", name: "\u4E2D\u5173\u6751\u897F\u533A" },
  { id: "7mBCDpja71jSg2kZXiNo7R", name: "A6\u5177\u8EAB\u667A\u80FD" },
  { id: "1HjUP8DHNsdA6cXtWxbEUt", name: "\u4E0A\u6D77\u9632\u6C5B" },
  { id: "3gGHgg1YEP8Eln8K0htraa", name: "\u4E0A\u6D77\u4E1C\u65B9\u67A2\u7EBD" }
];

// src/lib/enclosure-storage.ts
var EnclosureStorage = class {
  constructor(configDir) {
    this.configDir = configDir || join2(homedir2(), ".string-skill");
    this.enclosuresFile = join2(this.configDir, "enclosures.json");
  }
  /**
   * 加载围栏列表，文件不存在时返回默认数据
   */
  load() {
    try {
      if (!existsSync2(this.enclosuresFile)) {
        return [...DEFAULT_ENCLOSURES];
      }
      const content = readFileSync2(this.enclosuresFile, "utf-8");
      const config = JSON.parse(content);
      return config.enclosures ?? [...DEFAULT_ENCLOSURES];
    } catch {
      return [...DEFAULT_ENCLOSURES];
    }
  }
  /**
   * 保存围栏列表
   */
  save(enclosures) {
    if (!existsSync2(this.configDir)) {
      mkdirSync2(this.configDir, { recursive: true });
    }
    const config = { enclosures };
    writeFileSync2(this.enclosuresFile, JSON.stringify(config, null, 2), "utf-8");
  }
};

// src/lib/enclosure-manager.ts
var EnclosureManager = class {
  constructor(configDir) {
    this.storage = new EnclosureStorage(configDir);
    this.enclosures = /* @__PURE__ */ new Map();
    this.loadEnclosures();
  }
  loadEnclosures() {
    const list = this.storage.load();
    this.enclosures.clear();
    for (const e of list) {
      this.enclosures.set(e.id, e);
    }
  }
  saveEnclosures() {
    this.storage.save(Array.from(this.enclosures.values()));
  }
  add(enclosure) {
    if (this.enclosures.has(enclosure.id)) {
      throw new Error(`Enclosure with id "${enclosure.id}" already exists`);
    }
    this.enclosures.set(enclosure.id, enclosure);
    this.saveEnclosures();
  }
  update(id, updates) {
    const existing = this.enclosures.get(id);
    if (!existing) {
      throw new Error(`Enclosure with id "${id}" not found`);
    }
    const updated = { ...existing, ...updates };
    this.enclosures.set(id, updated);
    this.saveEnclosures();
  }
  delete(id) {
    if (!this.enclosures.has(id)) {
      throw new Error(`Enclosure with id "${id}" not found`);
    }
    this.enclosures.delete(id);
    this.saveEnclosures();
  }
  getById(id) {
    return this.enclosures.get(id);
  }
  list() {
    return Array.from(this.enclosures.values());
  }
  /**
   * 按名称部分匹配（模糊、不区分大小写）
   */
  findByNamePart(namePart) {
    const lower = namePart.toLowerCase();
    return this.list().filter((e) => e.name.toLowerCase().includes(lower));
  }
};

// src/lib/template-manager.ts
var TemplateManager = class {
  constructor(configDir) {
    this.storage = new Storage(configDir);
    this.renderer = new TemplateRenderer();
    this.enclosureManager = new EnclosureManager(configDir);
    this.templates = /* @__PURE__ */ new Map();
    this.loadTemplates();
  }
  /**
   * 从存储加载模版
   */
  loadTemplates() {
    const templates = this.storage.load();
    this.templates.clear();
    for (const template of templates) {
      this.templates.set(template.key, template);
    }
  }
  /**
   * 保存模版到存储
   */
  saveTemplates() {
    const templates = Array.from(this.templates.values());
    this.storage.save(templates);
  }
  /**
   * 添加模版
   * @param template 模版对象
   */
  add(template) {
    if (this.templates.has(template.key)) {
      throw new Error(`Template with key "${template.key}" already exists`);
    }
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
  update(key, updates) {
    const template = this.templates.get(key);
    if (!template) {
      throw new Error(`Template with key "${key}" not found`);
    }
    const updated = { ...template, ...updates };
    if (updates.content !== void 0) {
      updated.variables = this.renderer.extractVariables(updated.content);
    }
    this.templates.set(key, updated);
    this.saveTemplates();
  }
  /**
   * 删除模版
   * @param key 模版 key
   */
  delete(key) {
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
  get(key) {
    return this.templates.get(key);
  }
  /**
   * 列出所有模版
   * @returns 模版数组
   */
  list() {
    return Array.from(this.templates.values());
  }
  /**
   * 搜索模版
   * @param query 搜索关键词（匹配 key 或 name）
   * @returns 匹配的模版数组
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.list().filter(
      (template) => template.key.toLowerCase().includes(lowerQuery) || template.name.toLowerCase().includes(lowerQuery)
    );
  }
  /**
   * 按围栏名称部分解析 encId 并渲染模版（模版含 {encId} 时）
   * @param keyOrQuery 模版 key 或名称关键词
   * @param encNamePart 围栏名称部分（如「防汛」匹配「上海防汛」）
   * @param variables 其他变量
   * @returns 渲染结果数组（匹配到多个围栏时返回多条）
   */
  renderWithEncName(keyOrQuery, encNamePart, variables = {}) {
    let template = this.get(keyOrQuery);
    if (!template) {
      const found = this.search(keyOrQuery);
      if (found.length === 0) throw new Error(`Template not found: ${keyOrQuery}`);
      if (found.length > 1) throw new Error(`Multiple templates match "${keyOrQuery}", use exact key`);
      template = found[0];
    }
    const needsEncId = template.variables.includes("encId");
    if (!needsEncId) {
      const out = this.renderer.render(template, variables);
      return [out];
    }
    const enclosures = this.enclosureManager.findByNamePart(encNamePart);
    if (enclosures.length === 0) {
      throw new Error(`\u672A\u627E\u5230\u5339\u914D\u7684\u56F4\u680F: ${encNamePart}`);
    }
    return enclosures.map((enc) => {
      const vars = { ...variables, encId: enc.id };
      return this.renderer.render(template, vars);
    });
  }
  /**
   * 按 tag 搜索模版
   */
  searchByTag(tag) {
    return this.list().filter((t) => (t.tags ?? []).includes(tag));
  }
  /**
   * 按 tag 查找模版，并用围栏名称解析 encId，返回所有模版的渲染结果（多条）
   */
  renderByTagAndEncName(tag, encNamePart, variables = {}) {
    const templates = this.searchByTag(tag);
    if (templates.length === 0) {
      throw new Error(`\u672A\u627E\u5230 tag \u4E3A "${tag}" \u7684\u6A21\u7248`);
    }
    const results = [];
    for (const template of templates) {
      const rendered = this.renderWithEncName(template.key, encNamePart, variables);
      results.push(...rendered);
    }
    return results;
  }
};

export {
  Storage,
  TemplateRenderer,
  EnclosureStorage,
  EnclosureManager,
  TemplateManager
};
//# sourceMappingURL=chunk-BG557VT4.js.map