import type { Enclosure } from './types.js';
import { EnclosureStorage } from './enclosure-storage.js';

/**
 * 围栏 CRUD 管理
 */
export class EnclosureManager {
    private storage: EnclosureStorage;
    private enclosures: Map<string, Enclosure>;

    constructor(configDir?: string) {
        this.storage = new EnclosureStorage(configDir);
        this.enclosures = new Map();
        this.loadEnclosures();
    }

    private loadEnclosures(): void {
        const list = this.storage.load();
        this.enclosures.clear();
        for (const e of list) {
            this.enclosures.set(e.id, e);
        }
    }

    private saveEnclosures(): void {
        this.storage.save(Array.from(this.enclosures.values()));
    }

    add(enclosure: Enclosure): void {
        if (this.enclosures.has(enclosure.id)) {
            throw new Error(`Enclosure with id "${enclosure.id}" already exists`);
        }
        this.enclosures.set(enclosure.id, enclosure);
        this.saveEnclosures();
    }

    update(id: string, updates: Partial<Pick<Enclosure, 'name'>>): void {
        const existing = this.enclosures.get(id);
        if (!existing) {
            throw new Error(`Enclosure with id "${id}" not found`);
        }
        const updated = { ...existing, ...updates };
        this.enclosures.set(id, updated);
        this.saveEnclosures();
    }

    delete(id: string): void {
        if (!this.enclosures.has(id)) {
            throw new Error(`Enclosure with id "${id}" not found`);
        }
        this.enclosures.delete(id);
        this.saveEnclosures();
    }

    getById(id: string): Enclosure | undefined {
        return this.enclosures.get(id);
    }

    list(): Enclosure[] {
        return Array.from(this.enclosures.values());
    }

    /**
     * 按名称部分匹配（模糊、不区分大小写）
     */
    findByNamePart(namePart: string): Enclosure[] {
        const lower = namePart.toLowerCase();
        return this.list().filter(e => e.name.toLowerCase().includes(lower));
    }
}
