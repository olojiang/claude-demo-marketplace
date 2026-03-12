import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KVService } from '../kv-service';
import * as redisClientModule from '../redis-client';

// Mock Redis Client
const mockRedisClient = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    incr: vi.fn(),
    decr: vi.fn(),
    rPush: vi.fn(),
    lPush: vi.fn(),
    lRange: vi.fn(),
    lLen: vi.fn(),
    lPop: vi.fn(),
    rPop: vi.fn(),
    lIndex: vi.fn(),
    lSet: vi.fn(),
    lRem: vi.fn(),
    quit: vi.fn(),
    isOpen: true,
    connect: vi.fn(),
};

vi.spyOn(redisClientModule, 'getRedisClient').mockResolvedValue(mockRedisClient as any);

describe('KVService', () => {
    let kvService: KVService;

    beforeEach(() => {
        kvService = new KVService();
        vi.clearAllMocks();
    });

    describe('String Operations', () => {
        it('should set a string value', async () => {
            await kvService.set('test-key', 'test-value');
            expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', 'test-value');
        });

        it('should get a string value', async () => {
            mockRedisClient.get.mockResolvedValue('test-value');
            const result = await kvService.get('test-key');
            expect(result).toBe('test-value');
            expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
        });

        it('should return null if key does not exist', async () => {
            mockRedisClient.get.mockResolvedValue(null);
            const result = await kvService.get('non-existent-key');
            expect(result).toBeNull();
        });

    });

    describe('Number Operations', () => {
        it('should set a number value', async () => {
            await kvService.setNumber('test-num', 123);
            expect(mockRedisClient.set).toHaveBeenCalledWith('test-num', '123');
        });

        it('should get a number value', async () => {
            mockRedisClient.get.mockResolvedValue('123');
            const result = await kvService.getNumber('test-num');
            expect(result).toBe(123);
        });

        it('should increment a number', async () => {
            mockRedisClient.incr.mockResolvedValue(2);
            const result = await kvService.incr('test-counter');
            expect(result).toBe(2);
            expect(mockRedisClient.incr).toHaveBeenCalledWith('test-counter');
        });

        it('should decrement a number', async () => {
            mockRedisClient.decr.mockResolvedValue(1);
            const result = await kvService.decr('test-counter');
            expect(result).toBe(1);
            expect(mockRedisClient.decr).toHaveBeenCalledWith('test-counter');
        });
    });

    describe('List Operations', () => {
        it('should push to list (right)', async () => {
            mockRedisClient.rPush.mockResolvedValue(1);
            await kvService.rpush('test-list', 'val1', 'val2');
            expect(mockRedisClient.rPush).toHaveBeenCalledWith('test-list', ['val1', 'val2']);
        });

        it('should push to list (left)', async () => {
            mockRedisClient.lPush.mockResolvedValue(1);
            await kvService.lpush('test-list', 'val1');
            expect(mockRedisClient.lPush).toHaveBeenCalledWith('test-list', ['val1']);
        });

        it('should pop from list (right)', async () => {
            mockRedisClient.rPop.mockResolvedValue('val');
            const result = await kvService.rpop('test-list');
            expect(result).toBe('val');
            expect(mockRedisClient.rPop).toHaveBeenCalledWith('test-list');
        });

        it('should pop from list (left)', async () => {
            mockRedisClient.lPop.mockResolvedValue('val');
            const result = await kvService.lpop('test-list');
            expect(result).toBe('val');
            expect(mockRedisClient.lPop).toHaveBeenCalledWith('test-list');
        });

        it('should get list range', async () => {
            mockRedisClient.lRange.mockResolvedValue(['val1', 'val2']);
            const result = await kvService.lrange('test-list', 0, -1);
            expect(result).toEqual(['val1', 'val2']);
            expect(mockRedisClient.lRange).toHaveBeenCalledWith('test-list', 0, -1);
        });

        it('should get entire list', async () => {
            mockRedisClient.lRange.mockResolvedValue(['val1', 'val2']);
            const result = await kvService.getList('test-list');
            expect(result).toEqual(['val1', 'val2']);
            expect(mockRedisClient.lRange).toHaveBeenCalledWith('test-list', 0, -1);
        });
    });

    describe('JSON Operations', () => {
        it('should set json value', async () => {
            await kvService.setJson('test-json', { foo: 'bar' });
            expect(mockRedisClient.set).toHaveBeenCalledWith('test-json', JSON.stringify({ foo: 'bar' }));
        });

        it('should get json value', async () => {
            mockRedisClient.get.mockResolvedValue(JSON.stringify({ foo: 'bar' }));
            const result = await kvService.getJson('test-json');
            expect(result).toEqual({ foo: 'bar' });
        });

        it('should return null for non-existent json', async () => {
            mockRedisClient.get.mockResolvedValue(null);
            const result = await kvService.getJson('test-json');
            expect(result).toBeNull();
        });
    });
});
