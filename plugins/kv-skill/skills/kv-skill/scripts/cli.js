#!/usr/bin/env node
import {
  KVService
} from "./chunk-BJLZ3XQU.js";

// src/cli.ts
import { Command } from "commander";
var program = new Command();
var kvService = new KVService();
program.name("kv-skill").description("KV operations CLI").version("1.0.0");
var handleError = (error) => {
  console.error("Error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
};
var formatOutput = (data) => {
  if (typeof data === "object" && data !== null) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
};
program.command("set").description("Set a key-value pair").argument("<key>", "Key").argument("<value>", "Value").option("-e, --expire <seconds>", "Expiration time in seconds", parseInt).action(async (key, value, options) => {
  try {
    await kvService.set(key, value, options.expire);
    console.log(`Set ${key} successfully`);
  } catch (error) {
    handleError(error);
  }
});
program.command("get").description("Get a value by key").argument("<key>", "Key").action(async (key) => {
  try {
    const value = await kvService.get(key);
    formatOutput(value);
  } catch (error) {
    handleError(error);
  }
});
program.command("del").description("Delete a key").argument("<key>", "Key").action(async (key) => {
  try {
    const count = await kvService.del(key);
    console.log(`Deleted ${count} key(s)`);
  } catch (error) {
    handleError(error);
  }
});
program.command("incr").description("Increment a number value").argument("<key>", "Key").action(async (key) => {
  try {
    const value = await kvService.incr(key);
    console.log(value);
  } catch (error) {
    handleError(error);
  }
});
program.command("decr").description("Decrement a number value").argument("<key>", "Key").action(async (key) => {
  try {
    const value = await kvService.decr(key);
    console.log(value);
  } catch (error) {
    handleError(error);
  }
});
program.command("list-push").description("Push values to a list").argument("<key>", "Key").argument("<values...>", "Values to push").option("-l, --left", "Push to the left (head)", false).action(async (key, values, options) => {
  try {
    if (options.left) {
      await kvService.lpush(key, ...values);
    } else {
      await kvService.rpush(key, ...values);
    }
    console.log(`Pushed ${values.length} item(s) to list ${key}`);
  } catch (error) {
    handleError(error);
  }
});
program.command("list-pop").description("Pop value from a list").argument("<key>", "Key").option("-l, --left", "Pop from the left (head)", false).action(async (key, options) => {
  try {
    const value = options.left ? await kvService.lpop(key) : await kvService.rpop(key);
    formatOutput(value);
  } catch (error) {
    handleError(error);
  }
});
program.command("list-get").description("Get list items").argument("<key>", "Key").option("-s, --start <number>", "Start index", parseInt, 0).option("-e, --end <number>", "End index", parseInt, -1).action(async (key, options) => {
  try {
    const values = await kvService.lrange(key, options.start, options.end);
    formatOutput(values);
  } catch (error) {
    handleError(error);
  }
});
program.command("json-set").description("Set a JSON value").argument("<key>", "Key").argument("<json>", "JSON string").option("-e, --expire <seconds>", "Expiration time in seconds", parseInt).action(async (key, jsonString, options) => {
  try {
    const json = JSON.parse(jsonString);
    await kvService.setJson(key, json, options.expire);
    console.log(`Set JSON ${key} successfully`);
  } catch (error) {
    handleError(error);
  }
});
program.command("json-get").description("Get a JSON value").argument("<key>", "Key").action(async (key) => {
  try {
    const value = await kvService.getJson(key);
    formatOutput(value);
  } catch (error) {
    handleError(error);
  }
});
program.parse();
//# sourceMappingURL=cli.js.map