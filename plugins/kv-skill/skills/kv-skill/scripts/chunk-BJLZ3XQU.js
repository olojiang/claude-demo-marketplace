// src/lib/redis-client.ts
import { createClient } from "redis";
var redisClient = null;
var connectionPromise = null;
function getRedisUrl() {
  const url = process.env.REDIS_URL || process.env.KV_URL;
  if (!url) {
    throw new Error("REDIS_URL or KV_URL environment variable is not set");
  }
  return url;
}
async function getRedisClient() {
  if (redisClient?.isOpen) {
    return redisClient;
  }
  if (connectionPromise) {
    return connectionPromise;
  }
  connectionPromise = (async () => {
    try {
      const url = getRedisUrl();
      redisClient = createClient({ url });
      redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });
      await redisClient.connect();
      return redisClient;
    } catch (error) {
      connectionPromise = null;
      redisClient = null;
      throw error;
    }
  })();
  return connectionPromise;
}
async function closeRedisClient() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
    connectionPromise = null;
  }
}

// src/lib/kv-service.ts
var KVService = class {
  /**
   * Set a value
   */
  async set(key, value, ttlSeconds) {
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
  async get(key) {
    const client = await getRedisClient();
    return client.get(key);
  }
  /**
   * Delete a key
   */
  async del(key) {
    const client = await getRedisClient();
    return client.del(key);
  }
  /**
   * Check if key exists
   */
  async exists(key) {
    const client = await getRedisClient();
    return await client.exists(key) === 1;
  }
  /**
   * Set a number value
   */
  async setNumber(key, value, ttlSeconds) {
    await this.set(key, value.toString(), ttlSeconds);
  }
  /**
   * Get a number value
   */
  async getNumber(key) {
    const value = await this.get(key);
    if (value === null) return null;
    const num = Number.parseFloat(value);
    return Number.isNaN(num) ? null : num;
  }
  /**
   * Increment a number
   */
  async incr(key) {
    const client = await getRedisClient();
    return client.incr(key);
  }
  /**
   * Decrement a number
   */
  async decr(key) {
    const client = await getRedisClient();
    return client.decr(key);
  }
  /**
   * Push to list (right)
   */
  async rpush(key, ...values) {
    const client = await getRedisClient();
    return client.rPush(key, values);
  }
  /**
   * Push to list (left)
   */
  async lpush(key, ...values) {
    const client = await getRedisClient();
    return client.lPush(key, values);
  }
  /**
   * Pop from list (right)
   */
  async rpop(key) {
    const client = await getRedisClient();
    return client.rPop(key);
  }
  /**
   * Pop from list (left)
   */
  async lpop(key) {
    const client = await getRedisClient();
    return client.lPop(key);
  }
  /**
   * Get list range
   */
  async lrange(key, start, stop) {
    const client = await getRedisClient();
    return client.lRange(key, start, stop);
  }
  /**
   * Get entire list
   */
  async getList(key) {
    return this.lrange(key, 0, -1);
  }
  /**
   * Set JSON value
   */
  async setJson(key, value, ttlSeconds) {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }
  /**
   * Get JSON value
   */
  async getJson(key) {
    const value = await this.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
};

export {
  getRedisUrl,
  getRedisClient,
  closeRedisClient,
  KVService
};
//# sourceMappingURL=chunk-BJLZ3XQU.js.map