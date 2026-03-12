import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { Enclosure, EnclosureConfig } from './types.js';
import { DEFAULT_ENCLOSURES } from './default-enclosures.js';

/**
 * 围栏存储
 * 负责加载和保存 enclosures.json
 */
export class EnclosureStorage {
    private configDir: string;
    private enclosuresFile: string;

    constructor(configDir?: string) {
        this.configDir = configDir || join(homedir(), '.string-skill');
        this.enclosuresFile = join(this.configDir, 'enclosures.json');
    }

    /**
     * 加载围栏列表，文件不存在时返回默认数据
     */
    load(): Enclosure[] {
        try {
            if (!existsSync(this.enclosuresFile)) {
                return [...DEFAULT_ENCLOSURES];
            }

            const content = readFileSync(this.enclosuresFile, 'utf-8');
            const config: EnclosureConfig = JSON.parse(content);
            return config.enclosures ?? [...DEFAULT_ENCLOSURES];
        } catch {
            return [...DEFAULT_ENCLOSURES];
        }
    }

    /**
     * 保存围栏列表
     */
    save(enclosures: Enclosure[]): void {
        if (!existsSync(this.configDir)) {
            mkdirSync(this.configDir, { recursive: true });
        }

        const config: EnclosureConfig = { enclosures };
        writeFileSync(this.enclosuresFile, JSON.stringify(config, null, 2), 'utf-8');
    }
}
