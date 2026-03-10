import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { beforeEach, afterEach } from 'vitest';

let testDir;

export function useTestDir() {
  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'mhub-test-'));
    process.env.MESSAGE_HUB_DIR = testDir;
  });

  afterEach(() => {
    delete process.env.MESSAGE_HUB_DIR;
    if (testDir) rmSync(testDir, { recursive: true, force: true });
  });
}
