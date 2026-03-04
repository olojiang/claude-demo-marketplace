#!/usr/bin/env node

// src/cli.ts
import { parseArgs } from "util";
import path5 from "path";
import os from "os";

// src/store/daily-memory-store.ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
var DailyFileMemoryStore = class {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }
  getDailyFilePath(dateStr) {
    return path.join(this.baseDir, `${dateStr}.json`);
  }
  async readDailyFile(dateStr) {
    try {
      const filePath = this.getDailyFilePath(dateStr);
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  async writeDailyFile(dateStr, data) {
    await fs.mkdir(this.baseDir, { recursive: true });
    const filePath = this.getDailyFilePath(dateStr);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
  async save(entry) {
    const id = crypto.randomUUID();
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString();
    const dateStr = timestamp.split("T")[0];
    const fullEntry = {
      id,
      timestamp,
      content: entry.content,
      tags: entry.tags || [],
      metadata: entry.metadata || {}
    };
    const daily = await this.readDailyFile(dateStr);
    if (daily) {
      daily.entries.push(fullEntry);
      daily.entries.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      await this.writeDailyFile(dateStr, daily);
    } else {
      await this.writeDailyFile(dateStr, {
        date: dateStr,
        entries: [fullEntry]
      });
    }
    return id;
  }
  async get(id) {
    try {
      const files = await fs.readdir(this.baseDir);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const dateStr = file.replace(".json", "");
        const daily = await this.readDailyFile(dateStr);
        if (daily && daily.entries && Array.isArray(daily.entries)) {
          const entry = daily.entries.find((e) => e.id === id || e.id.startsWith(id));
          if (entry) return entry;
        }
      }
    } catch {
    }
    return null;
  }
  async list(filter) {
    try {
      const files = await fs.readdir(this.baseDir);
      const allEntries = [];
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const dateStr = file.replace(".json", "");
        const daily = await this.readDailyFile(dateStr);
        if (daily && daily.entries && Array.isArray(daily.entries)) {
          allEntries.push(...daily.entries);
        }
      }
      allEntries.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      if (!filter) return allEntries;
      return allEntries.filter((entry) => {
        if (filter.tags && filter.tags.length > 0) {
          if (!entry.tags || !filter.tags.some((tag) => entry.tags?.includes(tag))) {
            return false;
          }
        }
        if (filter.after && new Date(entry.timestamp) < new Date(filter.after)) return false;
        if (filter.before && new Date(entry.timestamp) > new Date(filter.before)) return false;
        return true;
      }).slice(0, filter.limit);
    } catch {
      return [];
    }
  }
  async search(query) {
    const all = await this.list();
    const lowerQuery = query.toLowerCase().replace(/[\p{P}\p{S}]/gu, " ").trim();
    const terms = this.extractSearchTerms(lowerQuery);
    if (terms.length === 0) return [];
    return all.map((entry) => {
      const content = entry.content.toLowerCase();
      const tagStr = (entry.tags || []).join(" ").toLowerCase();
      const haystack = content + " " + tagStr;
      const matchCount = terms.filter((term) => haystack.includes(term)).length;
      return { entry, matchCount };
    }).filter(({ matchCount }) => matchCount > 0).sort((a, b) => b.matchCount - a.matchCount).map(({ entry }) => entry);
  }
  extractSearchTerms(query) {
    const spaceTerms = query.split(/\s+/).filter((t) => t.length > 0);
    const terms = [];
    for (const term of spaceTerms) {
      if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(term) && term.length > 2) {
        const chars = [...term];
        for (let i = 0; i < chars.length - 1; i++) {
          terms.push(chars[i] + chars[i + 1]);
        }
      } else if (term.length > 0) {
        terms.push(term);
      }
    }
    return [...new Set(terms)];
  }
  async delete(id) {
    try {
      const files = await fs.readdir(this.baseDir);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const dateStr = file.replace(".json", "");
        const daily = await this.readDailyFile(dateStr);
        if (daily && daily.entries && Array.isArray(daily.entries)) {
          const index = daily.entries.findIndex((e) => e.id === id || e.id.startsWith(id));
          if (index !== -1) {
            daily.entries.splice(index, 1);
            if (daily.entries.length === 0) {
              await fs.unlink(this.getDailyFilePath(dateStr));
            } else {
              await this.writeDailyFile(dateStr, daily);
            }
            return true;
          }
        }
      }
    } catch {
    }
    return false;
  }
  /**
   * Append a conversation turn (prompt + response) to today's file
   */
  async appendConversation(prompt, response, tags = []) {
    const id = crypto.randomUUID();
    const now = /* @__PURE__ */ new Date();
    const timestamp = now.toISOString();
    const dateStr = timestamp.split("T")[0];
    const entry = {
      id,
      timestamp,
      content: `## User

${prompt}

## Assistant

${response}`,
      tags: [...tags, "conversation", "auto"],
      metadata: {
        type: "conversation",
        promptLength: prompt.length,
        responseLength: response.length
      }
    };
    const daily = await this.readDailyFile(dateStr);
    if (daily) {
      daily.entries.push(entry);
      daily.entries.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      await this.writeDailyFile(dateStr, daily);
    } else {
      await this.writeDailyFile(dateStr, {
        date: dateStr,
        entries: [entry]
      });
    }
    return id;
  }
};

// src/logic/archiver.ts
var Archiver = class {
  constructor(store) {
    this.store = store;
  }
  async archiveSession(session, options = {}) {
    const title = options.title || `Session ${(/* @__PURE__ */ new Date()).toISOString()}`;
    const tags = ["session", ...options.tags || []];
    if (session.metadata?.sessionId) {
      tags.push(String(session.metadata.sessionId));
    }
    let content = `# ${title}

`;
    content += `## Conversation

`;
    for (const msg of session.messages) {
      content += `**${msg.role}**: ${msg.content}

`;
    }
    return this.store.save({
      content,
      tags,
      metadata: session.metadata
    });
  }
};

// src/logic/project-id.ts
import path2 from "path";
function getProjectCcId(cwd) {
  return cwd.replace(/\//g, "-");
}

// src/logic/session-manager.ts
import fs2 from "fs/promises";
import path3 from "path";
async function listSessions(memoryDir) {
  try {
    const files = await fs2.readdir(memoryDir);
    const sessionFiles = [];
    for (const file of files) {
      if (!file.endsWith(".jsonl")) continue;
      const fullPath = path3.join(memoryDir, file);
      const stats = await fs2.stat(fullPath);
      sessionFiles.push({
        path: fullPath,
        timestamp: stats.mtime,
        id: path3.basename(file, ".jsonl")
      });
    }
    sessionFiles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return sessionFiles;
  } catch (error) {
    return [];
  }
}

// src/logic/archive-manager.ts
import fs3 from "fs/promises";
import path4 from "path";
import { spawn } from "child_process";
var defaultRunClaude = (prompt) => {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p"], {
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("error", (err) => {
      reject(err);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Claude process exited with code ${code}: ${stderr}`));
      }
    });
    child.stdin.write(prompt);
    child.stdin.end();
  });
};
var ArchiveManager = class {
  constructor(baseDir, runner) {
    this.baseDir = baseDir;
    this.stateFile = path4.join(baseDir, "archive_state.json");
    this.runner = runner || defaultRunClaude;
  }
  stateFile;
  state = null;
  runner;
  async loadState() {
    if (this.state) return;
    try {
      const content = await fs3.readFile(this.stateFile, "utf-8");
      this.state = JSON.parse(content);
    } catch (error) {
      if (error.code === "ENOENT") {
        this.state = { processedSessions: [] };
      } else {
        throw error;
      }
    }
  }
  async saveState() {
    if (!this.state) return;
    await fs3.writeFile(this.stateFile, JSON.stringify(this.state, null, 2));
  }
  async isProcessed(sessionId) {
    await this.loadState();
    return this.state?.processedSessions.includes(sessionId) ?? false;
  }
  async markProcessed(sessionId) {
    await this.loadState();
    if (this.state && !this.state.processedSessions.includes(sessionId)) {
      this.state.processedSessions.push(sessionId);
      await this.saveState();
    }
  }
  async summarizeSession(fileContent) {
    const promptText = `${fileContent}

\u538B\u7F29\u603B\u7ED3\u63D0\u70BC`;
    try {
      return await this.runner(promptText);
    } catch (error) {
      console.error("Summarization failed", error);
      return "Summarization failed.";
    }
  }
  async updateDailyArchive(date, newSessionSummary) {
    const filePath = path4.join(this.baseDir, `${date}.md`);
    let existingContent = "";
    try {
      existingContent = await fs3.readFile(filePath, "utf-8");
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
    if (!existingContent) {
      await fs3.writeFile(filePath, `# ${date} Memories

${newSessionSummary}
`);
      return;
    }
    console.log(`Merging session into ${date}.md...`);
    const prompt = `\u73B0\u6709\u603B\u7ED3\u5185\u5BB9\uFF1A
${existingContent}

\u65B0\u4F1A\u8BDD\u603B\u7ED3\uFF1A
${newSessionSummary}

\u4EFB\u52A1\uFF1A
\u8BF7\u5C06\u65B0\u4F1A\u8BDD\u603B\u7ED3\u878D\u5165\u5230\u73B0\u6709\u7684\u603B\u7ED3\u5185\u5BB9\u4E2D\u3002
1. \u5982\u679C\u65B0\u5185\u5BB9\u8865\u5145\u4E86\u73B0\u6709\u8BDD\u9898\uFF0C\u8BF7\u5408\u5E76\u4FE1\u606F\uFF0C\u786E\u4FDD\u903B\u8F91\u8FDE\u8D2F\u3002
2. \u5982\u679C\u65B0\u5185\u5BB9\u662F\u5168\u65B0\u8BDD\u9898\uFF0C\u8BF7\u65B0\u589E\u7AE0\u8282\u3002
3. \u4FDD\u6301 Markdown \u683C\u5F0F\u6574\u6D01\u3002
4. \u8F93\u51FA\u5B8C\u6574\u7684\u66F4\u65B0\u540E\u7684 Markdown \u5185\u5BB9\uFF08\u4E0D\u8981\u5305\u542B\u65E0\u5173\u7684\u5BF9\u8BDD\uFF09\u3002`;
    try {
      const mergedContent = await this.runner(prompt);
      if (mergedContent) {
        await fs3.writeFile(filePath, mergedContent);
      } else {
        console.error("Empty response from merge, falling back to append.");
        await fs3.appendFile(filePath, `

## New Session
${newSessionSummary}
`);
      }
    } catch (error) {
      console.error("Merge failed, appending instead.", error);
      await fs3.appendFile(filePath, `

## New Session (Merge Failed)
${newSessionSummary}
`);
    }
  }
  /**
   * @deprecated Use updateDailyArchive instead
   */
  async appendToArchive(date, summary) {
    return this.updateDailyArchive(date, summary);
  }
};

// src/cli.ts
import fs4 from "fs/promises";
async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h" },
      content: { type: "string", short: "c" },
      tags: { type: "string", short: "t" },
      id: { type: "string" },
      query: { type: "string", short: "q" },
      sessionFile: { type: "string" },
      title: { type: "string" },
      response: { type: "string", short: "r" }
    },
    allowPositionals: true
  });
  const command = positionals[0];
  const homeDir = os.homedir();
  const baseDir = process.env.PINEFIELD_MEMORY_DIR || path5.join(homeDir, ".pinefield", "memories");
  const store = new DailyFileMemoryStore(baseDir);
  const archiver = new Archiver(store);
  if (values.help || !command) {
    console.log(`
OpenClaw Memory Skill CLI

Usage:
  node dist/cli.js save --content "..." --tags "tag1,tag2"
  node dist/cli.js append --content "prompt" --response "assistant response" --tags "tag1,tag2"
  node dist/cli.js get --id <id>
  node dist/cli.js delete --id <id>
  node dist/cli.js search --query "..."
  node dist/cli.js list
  node dist/cli.js archive --session-file <path> --title "..."
    `);
    process.exit(0);
  }
  try {
    switch (command) {
      case "save":
        if (!values.content) throw new Error("--content is required");
        const tags = values.tags ? values.tags.split(",") : [];
        const id = await store.save({ content: values.content, tags });
        console.log(`Memory saved: ${id}`);
        break;
      case "append": {
        const prompt = values.content;
        const response = values.response;
        if (!prompt) throw new Error("--content (prompt) is required");
        if (!response) throw new Error("--response is required");
        const appendTags = values.tags ? values.tags.split(",") : [];
        const appendId = await store.appendConversation(prompt, response, appendTags);
        console.log(`Conversation saved: ${appendId}`);
        break;
      }
      case "get":
        if (!values.id) throw new Error("--id is required");
        const memory = await store.get(values.id);
        if (!memory) {
          console.error("Memory not found");
          process.exit(1);
        }
        console.log(JSON.stringify(memory, null, 2));
        break;
      case "delete":
        if (!values.id) throw new Error("--id is required");
        const deleted = await store.delete(values.id);
        if (deleted) {
          console.log(`Memory deleted: ${values.id}`);
        } else {
          console.error(`Memory not found: ${values.id}`);
          process.exit(1);
        }
        break;
      case "search":
        if (!values.query) throw new Error("--query is required");
        const results = await store.search(values.query);
        console.log(JSON.stringify(results, null, 2));
        break;
      case "list":
        const memories = await store.list();
        console.log(JSON.stringify(memories, null, 2));
        break;
      case "archive":
        const cwd = process.cwd();
        const ccId = getProjectCcId(cwd);
        console.log(`Project Context: ${ccId}`);
        const archiveManager = new ArchiveManager(baseDir);
        const projectMemoryDir = path5.join(os.homedir(), ".claude", "projects", ccId, "memory");
        console.log(`Scanning sessions in: ${projectMemoryDir}`);
        const sessions = await listSessions(projectMemoryDir);
        console.log(`Found ${sessions.length} sessions.`);
        let processedCount = 0;
        for (const session of sessions) {
          if (await archiveManager.isProcessed(session.id)) {
            continue;
          }
          console.log(`Processing session: ${session.id} (${session.timestamp.toISOString()})`);
          const sessionContent = await fs4.readFile(session.path, "utf-8");
          if (process.env.DRY_RUN) {
            console.log(`[DRY RUN] Would summarize session ${session.id}`);
            continue;
          }
          console.log("Generating summary...");
          const summary = await archiveManager.summarizeSession(sessionContent);
          const dateStr = session.timestamp.toISOString().split("T")[0];
          await archiveManager.appendToArchive(dateStr, `### Session ${session.id}

${summary}`);
          await archiveManager.markProcessed(session.id);
          processedCount++;
        }
        console.log(`Archiving complete. Processed ${processedCount} new sessions.`);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
    } else {
      console.error(`Error: ${String(err)}`);
    }
    process.exit(1);
  }
}
main();
//# sourceMappingURL=cli.js.map