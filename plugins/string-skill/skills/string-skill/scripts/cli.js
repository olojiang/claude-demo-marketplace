#!/usr/bin/env node
import {
  EnclosureManager,
  TemplateManager,
  TemplateRenderer
} from "./chunk-BG557VT4.js";

// src/cli.ts
import { Command } from "commander";
var configDir = process.env.STRING_SKILL_CONFIG_DIR;
var program = new Command();
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
//# sourceMappingURL=cli.js.map