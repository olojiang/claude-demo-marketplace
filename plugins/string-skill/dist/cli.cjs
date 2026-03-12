#!/usr/bin/env node
"use strict";

// src/cli.ts
var import_commander = require("commander");

// src/lib/storage.ts
var import_node_fs = require("fs");
var import_node_path = require("path");
var import_node_os = require("os");
var Storage = class {
  constructor(configDir2) {
    this.configDir = configDir2 || (0, import_node_path.join)((0, import_node_os.homedir)(), ".string-skill");
    this.configFile = (0, import_node_path.join)(this.configDir, "templates.json");
  }
  /**
   * 加载模版配置
   * @returns 模版数组
   */
  load() {
    try {
      if (!(0, import_node_fs.existsSync)(this.configFile)) {
        return [];
      }
      const content = (0, import_node_fs.readFileSync)(this.configFile, "utf-8");
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
      if (!(0, import_node_fs.existsSync)(this.configDir)) {
        (0, import_node_fs.mkdirSync)(this.configDir, { recursive: true });
      }
      const config = { templates };
      (0, import_node_fs.writeFileSync)(this.configFile, JSON.stringify(config, null, 2), "utf-8");
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
var import_node_fs2 = require("fs");
var import_node_path2 = require("path");
var import_node_os2 = require("os");

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
  constructor(configDir2) {
    this.configDir = configDir2 || (0, import_node_path2.join)((0, import_node_os2.homedir)(), ".string-skill");
    this.enclosuresFile = (0, import_node_path2.join)(this.configDir, "enclosures.json");
  }
  /**
   * 加载围栏列表，文件不存在时返回默认数据
   */
  load() {
    try {
      if (!(0, import_node_fs2.existsSync)(this.enclosuresFile)) {
        return [...DEFAULT_ENCLOSURES];
      }
      const content = (0, import_node_fs2.readFileSync)(this.enclosuresFile, "utf-8");
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
    if (!(0, import_node_fs2.existsSync)(this.configDir)) {
      (0, import_node_fs2.mkdirSync)(this.configDir, { recursive: true });
    }
    const config = { enclosures };
    (0, import_node_fs2.writeFileSync)(this.enclosuresFile, JSON.stringify(config, null, 2), "utf-8");
  }
};

// src/lib/enclosure-manager.ts
var EnclosureManager = class {
  constructor(configDir2) {
    this.storage = new EnclosureStorage(configDir2);
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
  constructor(configDir2) {
    this.storage = new Storage(configDir2);
    this.renderer = new TemplateRenderer();
    this.enclosureManager = new EnclosureManager(configDir2);
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

// src/cli.ts
var configDir = process.env.STRING_SKILL_CONFIG_DIR;
var program = new import_commander.Command();
var manager = new TemplateManager(configDir);
var renderer = new TemplateRenderer();
var enclosureManager = new EnclosureManager(configDir);
program.name("string-skill").description("\u5B57\u7B26\u4E32\u6A21\u7248\u7BA1\u7406\u5DE5\u5177").version("1.0.0");
program.command("add").description("\u6DFB\u52A0\u65B0\u7684\u5B57\u7B26\u4E32\u6A21\u7248").argument("<key>", "\u6A21\u7248\u552F\u4E00\u6807\u8BC6").argument("<content>", "\u6A21\u7248\u5185\u5BB9\uFF08\u652F\u6301 {variable} \u683C\u5F0F\uFF09").argument("<name>", "\u6A21\u7248\u540D\u79F0\uFF08\u4E2D\u6587\u63CF\u8FF0\uFF09").option("-t, --tags <tags>", "\u6807\u7B7E\uFF0C\u9017\u53F7\u5206\u9694\uFF08\u5982 link,\u9632\u6C5B\uFF09").action((key, content, name, options) => {
  try {
    const template = {
      key,
      name,
      content,
      variables: [],
      tags: options.tags ? options.tags.split(",").map((s) => s.trim()).filter(Boolean) : void 0
    };
    manager.add(template);
    console.log(`add - \u6210\u529F\u6DFB\u52A0\u6A21\u7248: ${name} (${key})`);
    const addedTemplate = manager.get(key);
    if (addedTemplate && addedTemplate.variables.length > 0) {
      console.log(`add - \u68C0\u6D4B\u5230\u53D8\u91CF: ${addedTemplate.variables.join(", ")}`);
    }
  } catch (error) {
    console.error("add - \u6DFB\u52A0\u5931\u8D25:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("update").description("\u66F4\u65B0\u73B0\u6709\u6A21\u7248").argument("<key>", "\u6A21\u7248 key").option("-c, --content <content>", "\u65B0\u7684\u6A21\u7248\u5185\u5BB9").option("-n, --name <name>", "\u65B0\u7684\u6A21\u7248\u540D\u79F0").option("-t, --tags <tags>", "\u6807\u7B7E\uFF0C\u9017\u53F7\u5206\u9694").action((key, options) => {
  try {
    if (!options.content && !options.name && options.tags === void 0) {
      console.error("update - \u8BF7\u81F3\u5C11\u63D0\u4F9B --content\u3001--name \u6216 --tags \u53C2\u6570");
      process.exit(1);
    }
    const updates = {};
    if (options.content) updates.content = options.content;
    if (options.name) updates.name = options.name;
    if (options.tags !== void 0) {
      updates.tags = options.tags ? options.tags.split(",").map((s) => s.trim()).filter(Boolean) : [];
    }
    manager.update(key, updates);
    console.log(`update - \u6210\u529F\u66F4\u65B0\u6A21\u7248: ${key}`);
    const updated = manager.get(key);
    if (updated && options.content && updated.variables.length > 0) {
      console.log(`update - \u68C0\u6D4B\u5230\u53D8\u91CF: ${updated.variables.join(", ")}`);
    }
  } catch (error) {
    console.error("update - \u66F4\u65B0\u5931\u8D25:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("delete").description("\u5220\u9664\u6A21\u7248").argument("<key>", "\u6A21\u7248 key").action((key) => {
  try {
    manager.delete(key);
    console.log(`delete - \u6210\u529F\u5220\u9664\u6A21\u7248: ${key}`);
  } catch (error) {
    console.error("delete - \u5220\u9664\u5931\u8D25:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("list").description("\u5217\u51FA\u6240\u6709\u6A21\u7248").action(() => {
  const templates = manager.list();
  if (templates.length === 0) {
    console.log("list - \u6682\u65E0\u6A21\u7248");
    return;
  }
  console.log(`
list - \u5171\u6709 ${templates.length} \u4E2A\u6A21\u7248:
`);
  templates.forEach((template) => {
    console.log(`  Key: ${template.key}`);
    console.log(`  \u540D\u79F0: ${template.name}`);
    console.log(`  \u5185\u5BB9: ${template.content}`);
    if (template.variables.length > 0) {
      console.log(`  \u53D8\u91CF: ${template.variables.join(", ")}`);
    }
    if (template.tags && template.tags.length > 0) {
      console.log(`  \u6807\u7B7E: ${template.tags.join(", ")}`);
    }
    console.log("");
  });
});
program.command("render").description("\u6E32\u67D3\u6A21\u7248\u5E76\u8F93\u51FA\u7ED3\u679C").argument("<key-or-name>", "\u6A21\u7248 key \u6216\u540D\u79F0").argument("[variables...]", "\u53D8\u91CF\u503C\uFF08\u683C\u5F0F: key=value\uFF09").option("-e, --enc <namePart>", "\u56F4\u680F\u540D\u79F0\u90E8\u5206\uFF0C\u81EA\u52A8\u89E3\u6790 encId\uFF08\u6A21\u7248\u542B {encId} \u65F6\uFF09").option("--by-tag <tag>", "\u6309 tag \u67E5\u627E\u6A21\u7248\u5E76\u6E32\u67D3\uFF08\u9700\u914D\u5408 --enc \u4F7F\u7528\uFF09").action((keyOrName, variableArgs, options) => {
  try {
    const variables = {};
    for (const arg of variableArgs) {
      const [key, ...valueParts] = arg.split("=");
      if (!key || valueParts.length === 0) {
        console.error(`render - \u53D8\u91CF\u683C\u5F0F\u9519\u8BEF: ${arg}\uFF0C\u5E94\u8BE5\u662F key=value \u683C\u5F0F`);
        process.exit(1);
      }
      variables[key] = valueParts.join("=");
    }
    if (options.byTag) {
      if (!options.enc) {
        console.error("render - \u4F7F\u7528 --by-tag \u65F6\u8BF7\u540C\u65F6\u6307\u5B9A --enc <\u56F4\u680F\u540D\u79F0\u90E8\u5206>");
        process.exit(1);
      }
      const results = manager.renderByTagAndEncName(options.byTag, options.enc, variables);
      results.forEach((r) => console.log(r));
      return;
    }
    if (options.enc) {
      const results = manager.renderWithEncName(keyOrName, options.enc, variables);
      results.forEach((r) => console.log(r));
      return;
    }
    let template = manager.get(keyOrName);
    if (!template) {
      const results = manager.search(keyOrName);
      if (results.length === 0) {
        console.error(`render - \u672A\u627E\u5230\u6A21\u7248: ${keyOrName}`);
        process.exit(1);
      }
      if (results.length > 1) {
        console.error(`render - \u627E\u5230\u591A\u4E2A\u5339\u914D\u7684\u6A21\u7248\uFF0C\u8BF7\u4F7F\u7528\u66F4\u7CBE\u786E\u7684\u5173\u952E\u8BCD:`);
        results.forEach((t) => console.error(`  - ${t.key} (${t.name})`));
        process.exit(1);
      }
      template = results[0];
    }
    const result = renderer.render(template, variables);
    console.log(result);
  } catch (error) {
    console.error("render - \u6E32\u67D3\u5931\u8D25:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.command("enclosure").description("\u56F4\u680F(enclosure) CRUD\uFF0C\u7EF4\u62A4 id-name \u5BF9\u4F9B encId \u89E3\u6790").argument("<action>", "add | list | delete | update").argument("[id-or-name]", "id \u6216\u540D\u79F0\uFF08add \u65F6\u4E3A name\uFF09").argument("[id]", "add \u65F6\u7684 id").option("-n, --name <name>", "update \u65F6\u7684\u65B0\u540D\u79F0").action((action, idOrName, id, options) => {
  try {
    switch (action) {
      case "add":
        if (!idOrName || !id) {
          console.error("enclosure - add \u7528\u6CD5: enclosure add <name> <id>");
          process.exit(1);
        }
        enclosureManager.add({ id, name: idOrName });
        console.log(`enclosure - \u5DF2\u6DFB\u52A0: ${idOrName} (${id})`);
        break;
      case "list": {
        const list = enclosureManager.list();
        if (list.length === 0) {
          console.log("enclosure - \u6682\u65E0\u56F4\u680F\uFF08\u5C06\u4F7F\u7528\u5185\u7F6E\u9ED8\u8BA4\u5217\u8868\uFF09");
          return;
        }
        console.log(`
enclosure - \u5171 ${list.length} \u4E2A\u56F4\u680F:
`);
        list.forEach((e) => console.log(`  ${e.name}: ${e.id}`));
        break;
      }
      case "delete":
        if (!idOrName) {
          console.error("enclosure - delete \u7528\u6CD5: enclosure delete <id>");
          process.exit(1);
        }
        enclosureManager.delete(idOrName);
        console.log(`enclosure - \u5DF2\u5220\u9664: ${idOrName}`);
        break;
      case "update":
        if (!idOrName || !options?.name) {
          console.error("enclosure - update \u7528\u6CD5: enclosure update <id> --name <\u65B0\u540D\u79F0>");
          process.exit(1);
        }
        enclosureManager.update(idOrName, { name: options.name });
        console.log(`enclosure - \u5DF2\u66F4\u65B0: ${idOrName} -> ${options.name}`);
        break;
      default:
        console.error(`enclosure - \u672A\u77E5\u64CD\u4F5C: ${action}\uFF0C\u652F\u6301 add | list | delete | update`);
        process.exit(1);
    }
  } catch (error) {
    console.error("enclosure - \u5931\u8D25:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=cli.cjs.map