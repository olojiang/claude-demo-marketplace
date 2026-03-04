"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/events.ts
var events_exports = {};
__export(events_exports, {
  EventStore: () => EventStore
});
var import_promises3, import_node_path3, import_node_os3, DEFAULT_DIR3, EVENTS_PATH, EventStore;
var init_events = __esm({
  "src/events.ts"() {
    "use strict";
    import_promises3 = __toESM(require("fs/promises"));
    import_node_path3 = __toESM(require("path"));
    import_node_os3 = __toESM(require("os"));
    DEFAULT_DIR3 = import_node_path3.default.join(import_node_os3.default.homedir(), ".pinefield", "scheduler");
    EVENTS_PATH = import_node_path3.default.join(DEFAULT_DIR3, "system_events.json");
    EventStore = class {
      async init() {
        await import_promises3.default.mkdir(DEFAULT_DIR3, { recursive: true });
        try {
          await import_promises3.default.access(EVENTS_PATH);
        } catch {
          await import_promises3.default.writeFile(EVENTS_PATH, JSON.stringify([], null, 2));
        }
      }
      async push(event) {
        const entry = {
          ...event,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        let events = [];
        try {
          const content = await import_promises3.default.readFile(EVENTS_PATH, "utf-8");
          events = JSON.parse(content);
        } catch {
        }
        events.push(entry);
        await import_promises3.default.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
      }
      async popAll() {
        try {
          const content = await import_promises3.default.readFile(EVENTS_PATH, "utf-8");
          const events = JSON.parse(content);
          if (events.length > 0) {
            await import_promises3.default.writeFile(EVENTS_PATH, JSON.stringify([], null, 2));
          }
          return events;
        } catch {
          return [];
        }
      }
    };
  }
});

// src/scheduler.ts
var import_croner = require("croner");
var Scheduler = class {
  store;
  executor;
  jobs = /* @__PURE__ */ new Map();
  activeExecutions = 0;
  heartbeatQueue = [];
  constructor(store, executor) {
    this.store = store;
    this.executor = executor;
  }
  async start() {
    console.log("[Scheduler] Starting...");
    await this.refresh();
  }
  async stop() {
    console.log("[Scheduler] Stopping...");
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();
  }
  async refresh() {
    console.log("[Scheduler] Refreshing tasks...");
    const tasks = await this.store.getAll();
    const activeIds = new Set(tasks.map((t) => t.id));
    for (const [id, job] of this.jobs) {
      if (!activeIds.has(id)) {
        console.log(`[Scheduler] Removing task ${id}`);
        job.stop();
        this.jobs.delete(id);
      }
    }
    for (const task of tasks) {
      if (!task.enabled) {
        if (this.jobs.has(task.id)) {
          this.jobs.get(task.id)?.stop();
          this.jobs.delete(task.id);
        }
        continue;
      }
      if (this.jobs.has(task.id)) {
        this.jobs.get(task.id)?.stop();
      }
      this.scheduleTask(task);
    }
  }
  scheduleTask(task) {
    console.log(`[Scheduler] Scheduling task ${task.id} (${task.name}) with schedule: ${task.schedule.value}`);
    try {
      const job = new import_croner.Cron(task.schedule.value, async () => {
        console.log(`[Scheduler] Triggering task ${task.id}`);
        if (task.payload.type === "heartbeat") {
          if (this.activeExecutions > 0) {
            console.log(`[Scheduler] System busy (${this.activeExecutions} active), queueing heartbeat ${task.id}`);
            this.heartbeatQueue.push(task);
            return;
          }
        }
        await this.executeTask(task);
      });
      this.jobs.set(task.id, job);
      const next = job.nextRun();
      if (next) {
        this.store.update(task.id, { nextRun: next.toISOString() }).catch(console.error);
      }
    } catch (e) {
      console.error(`[Scheduler] Failed to schedule task ${task.id}:`, e);
    }
  }
  async executeTask(task) {
    this.activeExecutions++;
    try {
      await this.store.update(task.id, { lastRun: (/* @__PURE__ */ new Date()).toISOString() });
      await this.executor.run(task);
      const job = this.jobs.get(task.id);
      if (job) {
        const nextRun = job.nextRun();
        if (nextRun) {
          await this.store.update(task.id, { nextRun: nextRun.toISOString() });
        }
      }
    } catch (error) {
      console.error(`[Scheduler] Error running task ${task.id}:`, error);
    } finally {
      this.activeExecutions--;
      this.processHeartbeatQueue();
    }
  }
  async processHeartbeatQueue() {
    if (this.activeExecutions > 0) return;
    while (this.heartbeatQueue.length > 0 && this.activeExecutions === 0) {
      const task = this.heartbeatQueue.shift();
      if (task) {
        console.log(`[Scheduler] Processing queued heartbeat ${task.id}`);
        await this.executeTask(task);
      }
    }
  }
};

// src/store.ts
var import_promises = __toESM(require("fs/promises"));
var import_node_path = __toESM(require("path"));
var import_node_os = __toESM(require("os"));

// src/types.ts
var import_zod = require("zod");
var ScheduleSchema = import_zod.z.object({
  type: import_zod.z.enum(["cron", "interval", "once"]),
  value: import_zod.z.string()
  // cron expression, interval string (e.g. "1h"), or ISO date for once
});
var TaskPayloadSchema = import_zod.z.object({
  type: import_zod.z.enum(["claude_code", "shell", "node", "python", "http", "heartbeat"]),
  command: import_zod.z.string().optional(),
  // For claude_code, shell, node, python. Optional for http/heartbeat
  args: import_zod.z.array(import_zod.z.string()).optional(),
  cwd: import_zod.z.string().optional(),
  // HTTP specific
  url: import_zod.z.string().optional(),
  method: import_zod.z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).optional(),
  headers: import_zod.z.record(import_zod.z.string(), import_zod.z.string()).optional(),
  body: import_zod.z.string().optional(),
  // Heartbeat specific
  checkFile: import_zod.z.string().optional(),
  // Default: ~/.pinefield/scheduler/HEARTBEAT.md
  silentToken: import_zod.z.string().optional()
  // Default: HEARTBEAT_OK
});
var TaskExecutionResultSchema = import_zod.z.object({
  id: import_zod.z.string(),
  taskId: import_zod.z.string(),
  startTime: import_zod.z.string().datetime(),
  endTime: import_zod.z.string().datetime(),
  status: import_zod.z.enum(["success", "failure"]),
  exitCode: import_zod.z.number().optional(),
  stdout: import_zod.z.string().optional(),
  stderr: import_zod.z.string().optional(),
  error: import_zod.z.string().optional()
});
var TaskSchema = import_zod.z.object({
  id: import_zod.z.string(),
  name: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  schedule: ScheduleSchema,
  payload: TaskPayloadSchema,
  enabled: import_zod.z.boolean().default(true),
  lastRun: import_zod.z.string().datetime().optional(),
  nextRun: import_zod.z.string().datetime().optional(),
  createdAt: import_zod.z.string().datetime(),
  updatedAt: import_zod.z.string().datetime()
});

// src/store.ts
var import_zod2 = require("zod");
var DEFAULT_DIR = import_node_path.default.join(import_node_os.default.homedir(), ".pinefield", "scheduler");
var DEFAULT_PATH = import_node_path.default.join(DEFAULT_DIR, "tasks.json");
var TaskStore = class {
  filePath;
  constructor(filePath) {
    this.filePath = filePath || DEFAULT_PATH;
  }
  async init() {
    try {
      await import_promises.default.mkdir(import_node_path.default.dirname(this.filePath), { recursive: true });
      try {
        await import_promises.default.access(this.filePath);
      } catch {
        await import_promises.default.writeFile(this.filePath, JSON.stringify([], null, 2));
      }
    } catch (e) {
      console.error("Failed to initialize store:", e);
      throw e;
    }
  }
  async getAll() {
    try {
      const data = await import_promises.default.readFile(this.filePath, "utf-8");
      const json = JSON.parse(data);
      return import_zod2.z.array(TaskSchema).parse(json);
    } catch (error) {
      return [];
    }
  }
  async get(id) {
    const tasks = await this.getAll();
    return tasks.find((t) => t.id === id);
  }
  async add(task) {
    const tasks = await this.getAll();
    tasks.push(task);
    await this.save(tasks);
  }
  async update(id, updates) {
    const tasks = await this.getAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    tasks[index] = { ...tasks[index], ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    await this.save(tasks);
  }
  async delete(id) {
    const tasks = await this.getAll();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.save(filtered);
  }
  async save(tasks) {
    await import_promises.default.writeFile(this.filePath, JSON.stringify(tasks, null, 2));
  }
};

// src/executor.ts
var import_node_child_process = require("child_process");

// src/history.ts
var import_promises2 = __toESM(require("fs/promises"));
var import_node_path2 = __toESM(require("path"));
var import_node_os2 = __toESM(require("os"));
var DEFAULT_DIR2 = import_node_path2.default.join(import_node_os2.default.homedir(), ".pinefield", "scheduler");
var HISTORY_PATH = import_node_path2.default.join(DEFAULT_DIR2, "tasks_execute_history.json");
var ERROR_PATH = import_node_path2.default.join(DEFAULT_DIR2, "task_execute_error.json");
var HistoryStore = class {
  async init() {
    await import_promises2.default.mkdir(DEFAULT_DIR2, { recursive: true });
  }
  async addResult(result) {
    await this.appendToFile(HISTORY_PATH, result);
    if (result.status === "failure") {
      await this.appendToFile(ERROR_PATH, result);
    }
  }
  async appendToFile(filePath, entry) {
    let data = [];
    try {
      const content = await import_promises2.default.readFile(filePath, "utf-8");
      data = JSON.parse(content);
    } catch {
    }
    data.push(entry);
    await import_promises2.default.writeFile(filePath, JSON.stringify(data, null, 2));
  }
};

// src/executor.ts
var import_uuid = require("uuid");
var TaskExecutor = class {
  history;
  constructor() {
    this.history = new HistoryStore();
    this.history.init().catch(console.error);
  }
  async run(task) {
    console.log(`[Executor] Starting task ${task.id}: ${task.name}`);
    const executionId = (0, import_uuid.v4)();
    const startTime = (/* @__PURE__ */ new Date()).toISOString();
    let result = {
      id: executionId,
      taskId: task.id,
      startTime,
      status: "success",
      stdout: "",
      stderr: ""
    };
    try {
      switch (task.payload.type) {
        case "claude_code":
          await this.runProcess(task, "claude", ["-p", task.payload.command || ""], result);
          break;
        case "shell":
          await this.runProcess(task, "/bin/sh", ["-c", task.payload.command || ""], result);
          break;
        case "node":
          await this.runProcess(task, "node", ["-e", task.payload.command || ""], result);
          break;
        case "python":
          await this.runProcess(task, "python3", ["-c", task.payload.command || ""], result);
          break;
        case "http":
          await this.runHttp(task, result);
          break;
        case "heartbeat":
          await this.runHeartbeat(task, result);
          break;
        default:
          console.warn(`[Executor] Unknown task type: ${task.payload.type}`);
          throw new Error(`Unknown task type: ${task.payload.type}`);
      }
    } catch (error) {
      result.status = "failure";
      result.error = error.message;
      console.error(`[Executor] Task ${task.id} failed:`, error);
    } finally {
      result.endTime = (/* @__PURE__ */ new Date()).toISOString();
      await this.history.addResult(result);
      console.log(`[Executor] Task ${task.id} finished. Status: ${result.status}`);
    }
  }
  async runProcess(task, command, args, result) {
    const finalArgs = [...args];
    if (task.payload.args) {
      finalArgs.push(...task.payload.args);
    }
    console.log(`[Executor] Spawning: ${command} ${finalArgs.join(" ")}`);
    return new Promise((resolve, reject) => {
      const child = (0, import_node_child_process.spawn)(command, finalArgs, {
        cwd: task.payload.cwd || process.cwd(),
        shell: false,
        // We supply shell explicitly if needed (e.g. /bin/sh)
        stdio: ["ignore", "pipe", "pipe"]
        // Capture output
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (data) => {
        const str = data.toString();
        stdout += str;
        console.log(`[${task.name} STDOUT] ${str.trim()}`);
      });
      child.stderr?.on("data", (data) => {
        const str = data.toString();
        stderr += str;
        console.error(`[${task.name} STDERR] ${str.trim()}`);
      });
      child.on("error", (err) => {
        reject(err);
      });
      child.on("close", (code) => {
        result.stdout = stdout;
        result.stderr = stderr;
        result.exitCode = code ?? void 0;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }
  async runHttp(task, result) {
    if (!task.payload.url) {
      throw new Error("Missing URL for HTTP task");
    }
    console.log(`[Executor] HTTP Request: ${task.payload.method || "GET"} ${task.payload.url}`);
    const response = await fetch(task.payload.url, {
      method: task.payload.method || "GET",
      headers: task.payload.headers,
      body: task.payload.body
    });
    const text = await response.text();
    result.stdout = text;
    result.exitCode = response.status;
    if (!response.ok) {
      throw new Error(`HTTP request failed with status ${response.status}`);
    }
  }
  async runHeartbeat(task, result) {
    const { EventStore: EventStore2 } = await Promise.resolve().then(() => (init_events(), events_exports));
    const eventStore = new EventStore2();
    const events = await eventStore.popAll();
    const checkFile = task.payload.checkFile || `${process.env.HOME}/.pinefield/scheduler/HEARTBEAT.md`;
    let fileContent = "";
    try {
      const fs5 = await import("fs/promises");
      fileContent = await fs5.readFile(checkFile, "utf-8");
    } catch {
    }
    if (events.length === 0 && (!fileContent || fileContent.trim().length === 0)) {
      console.log("[Executor] Heartbeat skipped: No events and empty HEARTBEAT.md");
      result.stdout = "Skipped (Empty)";
      return;
    }
    const prompt = `
System Events:
${JSON.stringify(events, null, 2)}

Heartbeat Instructions (${checkFile}):
${fileContent}

Task:
${task.payload.command || "Check system status and respond."}

Instruction:
If there are no actionable items in the events or instructions, reply exactly with '${task.payload.silentToken || "HEARTBEAT_OK"}'.
Otherwise, respond to the user with a summary or action report.
`;
    const subTask = {
      ...task,
      payload: {
        ...task.payload,
        type: "claude_code",
        command: prompt
      }
    };
    const subResult = {};
    try {
      await this.runProcess(subTask, "claude", ["-p", prompt], subResult);
      const output = (subResult.stdout || "").trim();
      const silentToken = task.payload.silentToken || "HEARTBEAT_OK";
      if (output === silentToken) {
        console.log("[Executor] Heartbeat Silent.");
        result.stdout = "Silent";
      } else {
        console.log("[Executor] Heartbeat Active Response.");
        result.stdout = subResult.stdout;
      }
    } catch (e) {
      throw new Error(`Heartbeat execution failed: ${e.message}`);
    }
  }
};

// src/daemon.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path4 = __toESM(require("path"));
var import_node_os4 = __toESM(require("os"));
async function main() {
  console.log("Starting Pinefield Scheduler Daemon...");
  const store = new TaskStore();
  await store.init();
  const executor = new TaskExecutor();
  const scheduler = new Scheduler(store, executor);
  await scheduler.start();
  const DEFAULT_DIR4 = import_node_path4.default.join(import_node_os4.default.homedir(), ".pinefield", "scheduler");
  const DEFAULT_PATH2 = import_node_path4.default.join(DEFAULT_DIR4, "tasks.json");
  console.log(`Watching for changes in ${DEFAULT_PATH2}`);
  import_node_fs.default.watchFile(DEFAULT_PATH2, { interval: 1e3 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log("Tasks file changed, reloading...");
      scheduler.refresh().catch(console.error);
    }
  });
  setInterval(() => {
  }, 1e3 * 60 * 60);
  const cleanup = async () => {
    console.log("Shutting down...");
    await scheduler.stop();
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
main().catch(console.error);
//# sourceMappingURL=daemon.js.map