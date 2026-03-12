import { getRedisClient } from './redis-client.js';

export class KVService {
    /**
     * Set a value
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        const client = await getRedisClient();
        if (ttlSeconds) {
            await client.setEx(key, ttlSeconds, value);
        } else {
            await client.set(key, value);
        }
    }

    /**
     * Get a value
     */
    async get(key: string): Promise<string | null> {
        const client = await getRedisClient();
        return client.get(key);
    }

    /**
     * Delete a key
     */
    async del(key: string): Promise<number> {
        const client = await getRedisClient();
        return client.del(key);
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        const client = await getRedisClient();
        return (await client.exists(key)) === 1;
    }

    /**
     * Set a number value
     */
    async setNumber(key: string, value: number, ttlSeconds?: number): Promise<void> {
        await this.set(key, value.toString(), ttlSeconds);
    }

    /**
     * Get a number value
     */
    async getNumber(key: string): Promise<number | null> {
        const value = await this.get(key);
        if (value === null) return null;
        const num = Number.parseFloat(value);
        return Number.isNaN(num) ? null : num;
    }

    /**
     * Increment a number
     */
    async incr(key: string): Promise<number> {
        const client = await getRedisClient();
        return client.incr(key);
    }

    /**
     * Decrement a number
     */
    async decr(key: string): Promise<number> {
        const client = await getRedisClient();
        return client.decr(key);
    }

    /**
     * Push to list (right)
     */
    async rpush(key: string, ...values: string[]): Promise<number> {
        const client = await getRedisClient();
        return client.rPush(key, values);
    }

    /**
     * Push to list (left)
     */
    async lpush(key: string, ...values: string[]): Promise<number> {
        const client = await getRedisClient();
        return client.lPush(key, values);
    }

    /**
     * Pop from list (right)
     */
    async rpop(key: string): Promise<string | null> {
        const client = await getRedisClient();
        return client.rPop(key);
    }

    /**
     * Pop from list (left)
     */
    async lpop(key: string): Promise<string | null> {
        const client = await getRedisClient();
        return client.lPop(key);
    }

    /**
     * Get list range
     */
    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        const client = await getRedisClient();
        return client.lRange(key, start, stop);
    }

    /**
     * Get entire list
     */
    async getList(key: string): Promise<string[]> {
        return this.lrange(key, 0, -1);
    }

    /**
     * Set JSON value
     */
    async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        await this.set(key, JSON.stringify(value), ttlSeconds);
    }

    /**
     * Get JSON value
     */
    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        if (value === null) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    }
}
