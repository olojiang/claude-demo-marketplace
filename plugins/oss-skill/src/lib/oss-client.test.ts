import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    createOssClient,
    isValidBucket,
    generateDownloadUrl,
    uploadToOss,
    downloadFromOss,
    listBuckets,
    getBucketInfo,
    listObjects,
    deleteObject,
    renameObject,
    putSymlink,
    generateSignatureUrl,
} from './oss-client'
import OSS from 'ali-oss'

// Mock ali-oss
vi.mock('ali-oss', () => {
    const OSSConstructor = vi.fn()
    OSSConstructor.prototype.put = vi.fn()
    OSSConstructor.prototype.get = vi.fn()
    OSSConstructor.prototype.listBuckets = vi.fn()
    OSSConstructor.prototype.getBucketInfo = vi.fn()
    OSSConstructor.prototype.listV2 = vi.fn()
    OSSConstructor.prototype.delete = vi.fn()
    OSSConstructor.prototype.copy = vi.fn()
    OSSConstructor.prototype.putSymlink = vi.fn()
    OSSConstructor.prototype.signatureUrlV4 = vi.fn()
    return { default: OSSConstructor }
})

describe('OSS Client', () => {
    const mockBucket = 'pf-test-public-web'
    const mockFileContent = Buffer.from('test content')
    const mockPath = 'test/file.txt'

    beforeEach(() => {
        vi.clearAllMocks()
        process.env.OSS_ENDPOINT = 'https://oss-cn-zhangjiakou.aliyuncs.com'
        process.env.OSS_ACCESS_KEY_ID = 'test-id'
        process.env.OSS_ACCESS_KEY_SECRET = 'test-secret'
    })

    afterEach(() => {
        vi.clearAllMocks()
        delete process.env.OSS_ENDPOINT
        delete process.env.OSS_ACCESS_KEY_ID
        delete process.env.OSS_ACCESS_KEY_SECRET
    })

    it('should validate allowed buckets', () => {
        expect(isValidBucket('pf-test-public-web')).toBe(true)
        expect(isValidBucket('invalid-bucket')).toBe(false)
    })

    it('should generate correct download URL', () => {
        const url = generateDownloadUrl('pf-test-public-web', 'test/file.txt')
        expect(url).toContain('https://test.sheepwall.com/test/file.txt')
    })

    it('should upload file to OSS', async () => {
        const mockPut = vi.fn().mockResolvedValue({ url: 'http://oss-url/test/file.txt' })
        vi.mocked(OSS).prototype.put = mockPut

        const result = await uploadToOss(mockBucket, mockPath, mockFileContent)

        expect(mockPut).toHaveBeenCalledWith(mockPath, expect.any(Buffer), expect.any(Object))
        expect(result).toBeDefined()
    })

    it('should fail upload if bucket is invalid', async () => {
        await expect(uploadToOss('invalid-bucket', mockPath, mockFileContent))
            .rejects.toThrow('Bucket "invalid-bucket" is not in the allowed list')
    })

    it('should download file from OSS', async () => {
        const mockGet = vi.fn().mockResolvedValue({ content: mockFileContent })
        vi.mocked(OSS).prototype.get = mockGet

        const result = await downloadFromOss(mockBucket, mockPath)

        expect(mockGet).toHaveBeenCalledWith(mockPath)
        expect(result).toEqual(mockFileContent)
    })

    it('should list buckets', async () => {
        const mockBuckets = [{ name: 'bucket1' }, { name: 'bucket2' }]
        const mockList = vi.fn().mockResolvedValue(mockBuckets)
        vi.mocked(OSS).prototype.listBuckets = mockList

        const result = await listBuckets()

        expect(mockList).toHaveBeenCalled()
        expect(result).toEqual(mockBuckets)
    })

    it('should get bucket info', async () => {
        const mockInfo = { name: mockBucket, location: 'oss-cn-zhangjiakou' }
        const mockGetInfo = vi.fn().mockResolvedValue({ bucket: mockInfo })
        vi.mocked(OSS).prototype.getBucketInfo = mockGetInfo

        const result = await getBucketInfo(mockBucket)

        expect(mockGetInfo).toHaveBeenCalledWith(mockBucket)
        expect(result).toEqual(mockInfo)
    })

    it('should list objects', async () => {
        const mockObjects = [{ name: 'file1.txt' }, { name: 'file2.txt' }]
        const mockListV2 = vi.fn().mockResolvedValue({ objects: mockObjects })
        vi.mocked(OSS).prototype.listV2 = mockListV2

        const result = await listObjects(mockBucket)

        expect(mockListV2).toHaveBeenCalled()
        expect(result.objects).toEqual(mockObjects)
    })

    it('should delete object', async () => {
        const mockDelete = vi.fn().mockResolvedValue({})
        vi.mocked(OSS).prototype.delete = mockDelete

        await deleteObject(mockBucket, mockPath)

        expect(mockDelete).toHaveBeenCalledWith(mockPath)
    })

    it('should rename object', async () => {
        const mockCopy = vi.fn().mockResolvedValue({})
        const mockDelete = vi.fn().mockResolvedValue({})
        vi.mocked(OSS).prototype.copy = mockCopy
        vi.mocked(OSS).prototype.delete = mockDelete

        await renameObject(mockBucket, mockPath, 'new/path.txt')

        expect(mockCopy).toHaveBeenCalledWith('new/path.txt', mockPath)
        expect(mockDelete).toHaveBeenCalledWith(mockPath)
    })

    it('should put symlink', async () => {
        const mockPutSymlink = vi.fn().mockResolvedValue({})
        vi.mocked(OSS).prototype.putSymlink = mockPutSymlink

        await putSymlink(mockBucket, 'symlink', mockPath)

        expect(mockPutSymlink).toHaveBeenCalledWith('symlink', mockPath, expect.any(Object))
    })

    it('should generate signature url', async () => {
        const mockSignUrl = vi.fn().mockResolvedValue('http://signed-url')
        vi.mocked(OSS).prototype.signatureUrlV4 = mockSignUrl

        const url = await generateSignatureUrl(mockBucket, mockPath)

        expect(mockSignUrl).toHaveBeenCalledWith('GET', 3600, expect.any(Object), mockPath)
        expect(url).toBe('http://signed-url')
    })
})
