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
var import_promises2, import_node_path2, import_node_os2, DEFAULT_DIR2, EVENTS_PATH, EventStore;
var init_events = __esm({
  "src/events.ts"() {
    "use strict";
    import_promises2 = __toESM(require("fs/promises"));
    import_node_path2 = __toESM(require("path"));
    import_node_os2 = __toESM(require("os"));
    DEFAULT_DIR2 = import_node_path2.default.join(import_node_os2.default.homedir(), ".pinefield", "scheduler");
    EVENTS_PATH = import_node_path2.default.join(DEFAULT_DIR2, "system_events.json");
    EventStore = class {
      async init() {
        await import_promises2.default.mkdir(DEFAULT_DIR2, { recursive: true });
        try {
          await import_promises2.default.access(EVENTS_PATH);
        } catch {
          await import_promises2.default.writeFile(EVENTS_PATH, JSON.stringify([], null, 2));
        }
      }
      async push(event) {
        const entry = {
          ...event,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        let events = [];
        try {
          const content = await import_promises2.default.readFile(EVENTS_PATH, "utf-8");
          events = JSON.parse(content);
        } catch {
        }
        events.push(entry);
        await import_promises2.default.writeFile(EVENTS_PATH, JSON.stringify(events, null, 2));
      }
      async popAll() {
        try {
          const content = await import_promises2.default.readFile(EVENTS_PATH, "utf-8");
          const events = JSON.parse(content);
          if (events.length > 0) {
            await import_promises2.default.writeFile(EVENTS_PATH, JSON.stringify([], null, 2));
          }
          return events;
        } catch {
          return [];
        }
      }
    };
  }
});

// src/mcp-server.ts
var import_server = require("@modelcontextprotocol/sdk/server/index.js");
var import_stdio = require("@modelcontextprotocol/sdk/server/stdio.js");
var import_types2 = require("@modelcontextprotocol/sdk/types.js");

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

// src/mcp-server.ts
var import_uuid = require("uuid");
var server = new import_server.Server(
  {
    name: "pinefield-scheduler",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
var store = new TaskStore();
store.init().catch(console.error);
server.setRequestHandler(import_types2.ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_task",
        description: "Create a new scheduled task. Supports claude_code, shell, node, python, and http.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            schedule_value: { type: "string", description: "Cron expression or interval" },
            type: {
              type: "string",
              enum: ["claude_code", "shell", "node", "python", "http"],
              description: "Type of task. Defaults to claude_code."
            },
            command: { type: "string", description: "Command/Prompt/Script to execute. Required for non-HTTP tasks." },
            url: { type: "string", description: "URL for HTTP tasks" },
            method: { type: "string", description: "HTTP method" },
            body: { type: "string", description: "HTTP body" }
          },
          required: ["name", "schedule_value"]
        }
      },
      {
        name: "list_tasks",
        description: "List all scheduled tasks.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "delete_task",
        description: "Delete a scheduled task by ID.",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "string", description: "ID of the task to delete" }
          },
          required: ["id"]
        }
      },
      {
        name: "trigger_heartbeat",
        description: "Immediately trigger a heartbeat task. Only runs if system is idle.",
        inputSchema: {
          type: "object",
          properties: {
            checkFile: { type: "string", description: "Optional path to HEARTBEAT.md" },
            silentToken: { type: "string", description: "Optional silent token" }
          }
        }
      },
      {
        name: "push_event",
        description: "Push a system event to be processed by the next heartbeat.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", description: "Event type" },
            payload: { type: "object", description: "Event payload JSON" }
          },
          required: ["type", "payload"]
        }
      }
    ]
  };
});
server.setRequestHandler(import_types2.CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "create_task": {
      const args = request.params.arguments;
      const type = args.type || "claude_code";
      const payload = { type };
      if (type === "http") {
        payload.url = args.url;
        payload.method = args.method;
        payload.body = args.body;
      } else {
        payload.command = args.command || args.prompt;
      }
      const task = {
        id: (0, import_uuid.v4)(),
        name: args.name,
        schedule: {
          type: "cron",
          value: args.schedule_value
        },
        payload,
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await store.add(task);
      return {
        content: [
          {
            type: "text",
            text: `Task created successfully with ID: ${task.id}`
          }
        ]
      };
    }
    case "list_tasks": {
      const tasks = await store.getAll();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tasks, null, 2)
          }
        ]
      };
    }
    case "delete_task": {
      const id = String(request.params.arguments?.id);
      await store.delete(id);
      return {
        content: [
          {
            type: "text",
            text: `Task ${id} deleted successfully.`
          }
        ]
      };
    }
    case "trigger_heartbeat": {
      const args = request.params.arguments;
      const task = {
        id: (0, import_uuid.v4)(),
        name: "Manual Heartbeat",
        schedule: { type: "once", value: (/* @__PURE__ */ new Date()).toISOString() },
        payload: {
          type: "heartbeat",
          checkFile: args.checkFile,
          silentToken: args.silentToken
        },
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await store.add(task);
      return {
        content: [
          {
            type: "text",
            text: `Heartbeat triggered (Task ID: ${task.id}). It will run shortly when system is idle.`
          }
        ]
      };
    }
    case "push_event": {
      const args = request.params.arguments;
      const { EventStore: EventStore2 } = await Promise.resolve().then(() => (init_events(), events_exports));
      const eventStore = new EventStore2();
      await eventStore.push({
        id: (0, import_uuid.v4)(),
        type: args.type,
        payload: args.payload
      });
      return {
        content: [
          {
            type: "text",
            text: `Event pushed: ${args.type}`
          }
        ]
      };
    }
    default:
      throw new Error("Unknown tool");
  }
});
async function main() {
  const transport = new import_stdio.StdioServerTransport();
  await server.connect(transport);
}
main().catch(console.error);
//# sourceMappingURL=mcp-server.js.map