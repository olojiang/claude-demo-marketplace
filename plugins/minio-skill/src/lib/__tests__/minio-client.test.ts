import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MinioService } from '../minio-client'
import { EventEmitter } from 'events'

const listBucketsMock = vi.fn()
const listObjectsMock = vi.fn()
const fPutObjectMock = vi.fn()
const fGetObjectMock = vi.fn()
const removeObjectMock = vi.fn()

vi.mock('minio', () => {
    class MockClient {
        constructor(public config: any) {}
        listBuckets = listBucketsMock
        listObjects = listObjectsMock
        fPutObject = fPutObjectMock
        fGetObject = fGetObjectMock
        removeObject = removeObjectMock
    }
    return {
        Client: MockClient,
    }
})

describe('MinioService', () => {
    let service: MinioService
    const config = {
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: 'minioadmin',
        secretKey: 'minioadmin',
    }

    beforeEach(() => {
        vi.clearAllMocks()
        service = new MinioService(config)
    })

    it('should list buckets', async () => {
        const buckets = [{ name: 'test-bucket', creationDate: new Date() }]
        listBucketsMock.mockResolvedValue(buckets)
        const result = await service.listBuckets()
        expect(listBucketsMock).toHaveBeenCalled()
        expect(result).toEqual(buckets)
    })

    it('should list objects', async () => {
        const stream = new EventEmitter()
        listObjectsMock.mockReturnValue(stream)

        const promise = service.listObjects('test-bucket', 'prefix', true)

        const obj = { name: 'file.txt', size: 1024 }
        stream.emit('data', obj)
        stream.emit('end')

        const result = await promise
        expect(listObjectsMock).toHaveBeenCalledWith('test-bucket', 'prefix', true)
        expect(result).toEqual([obj])
    })

    it('should reject on stream error', async () => {
        const stream = new EventEmitter()
        listObjectsMock.mockReturnValue(stream)

        const promise = service.listObjects('test-bucket')
        stream.emit('error', new Error('stream error'))

        await expect(promise).rejects.toThrow('stream error')
    })

    it('should use defaults for prefix and recursive', async () => {
        const stream = new EventEmitter()
        listObjectsMock.mockReturnValue(stream)

        const promise = service.listObjects('test-bucket')
        stream.emit('end')
        await promise

        expect(listObjectsMock).toHaveBeenCalledWith('test-bucket', '', false)
    })

    it('should upload file', async () => {
        fPutObjectMock.mockResolvedValue({ etag: '123' })
        await service.uploadFile('bucket', 'object', 'path/to/file')
        expect(fPutObjectMock).toHaveBeenCalledWith('bucket', 'object', 'path/to/file', {})
    })

    it('should upload file with metadata', async () => {
        fPutObjectMock.mockResolvedValue({ etag: '123' })
        await service.uploadFile('bucket', 'object', 'path/to/file', { 'Content-Type': 'text/plain' })
        expect(fPutObjectMock).toHaveBeenCalledWith('bucket', 'object', 'path/to/file', { 'Content-Type': 'text/plain' })
    })

    it('should download file', async () => {
        fGetObjectMock.mockResolvedValue({})
        await service.downloadFile('bucket', 'object', 'path/to/file')
        expect(fGetObjectMock).toHaveBeenCalledWith('bucket', 'object', 'path/to/file')
    })

    it('should remove object', async () => {
        removeObjectMock.mockResolvedValue({})
        await service.removeObject('bucket', 'object')
        expect(removeObjectMock).toHaveBeenCalledWith('bucket', 'object')
    })
})
