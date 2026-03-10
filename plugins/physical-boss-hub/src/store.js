import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export function getDataDir() {
  const dir =
    process.env.MESSAGE_HUB_DIR ||
    join(homedir(), ".pinefield", "physical-boss-hub");
  ensureDir(dir);
  return dir;
}

export function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function readJSON(filepath, fallback = null) {
  try {
    if (!existsSync(filepath)) return fallback;
    const raw = readFileSync(filepath, "utf-8").trim();
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(filepath, data) {
  ensureDir(dirname(filepath));
  writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
}

export function listDirs(parentDir) {
  if (!existsSync(parentDir)) return [];
  return readdirSync(parentDir).filter((name) => {
    try {
      return statSync(join(parentDir, name)).isDirectory();
    } catch {
      return false;
    }
  });
}
