import { createClient, type RedisClientType } from 'redis';

// Global Redis client instance
let redisClient: RedisClientType | null = null;
let connectionPromise: Promise<RedisClientType> | null = null;

/**
 * Get Redis connection URL from environment variables
 */
export function getRedisUrl(): string {
    const url = process.env.REDIS_URL || process.env.KV_URL;
    if (!url) {
        throw new Error('REDIS_URL or KV_URL environment variable is not set');
    }
    return url;
}

/**
 * Get or create Redis client connection
 */
export async function getRedisClient(): Promise<RedisClientType> {
    // Return existing connection if open
    if (redisClient?.isOpen) {
        return redisClient;
    }

    // Return existing promise if connecting
    if (connectionPromise) {
        return connectionPromise;
    }

    // Create new connection
    connectionPromise = (async () => {
        try {
            const url = getRedisUrl();
            redisClient = createClient({ url });

            redisClient.on('error', (err) => {
                console.error('Redis Client Error:', err);
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

/**
 * Close Redis client connection
 */
export async function closeRedisClient(): Promise<void> {
    if (redisClient?.isOpen) {
        await redisClient.quit();
        redisClient = null;
        connectionPromise = null;
    }
}
