/**
 * OSS 客户端工具函数
 * 基于阿里云 OSS SDK 实现文件上传、下载、列举等功能
 */

import OSS from 'ali-oss'
import dotenv from 'dotenv'

import {
    DEFAULT_OSS_ENDPOINT,
    DEFAULT_ALLOWED_BUCKETS,
} from './config'

dotenv.config()

function getOssEndpoint(): string {
    return process.env.OSS_ENDPOINT || DEFAULT_OSS_ENDPOINT
}

function getOssAccessKeyId(): string {
    const key = process.env.OSS_ACCESS_KEY_ID || process.env.DORAEMON_OSSACCESSKEY
    if (!key) {
        throw new Error('OSS_ACCESS_KEY_ID environment variable is not set')
    }
    return key
}

function getOssAccessKeySecret(): string {
    const secret = process.env.OSS_ACCESS_KEY_SECRET || process.env.DORAEMON_OSSACCESSSECRET
    if (!secret) {
        throw new Error('OSS_ACCESS_KEY_SECRET environment variable is not set')
    }
    return secret
}

// 允许的 bucket 列表
const ALLOWED_BUCKETS = process.env.ALLOWED_BUCKETS ? process.env.ALLOWED_BUCKETS.split(',') : DEFAULT_ALLOWED_BUCKETS

// ServiceBaseUrl 和 UploadPrivateAddr（用于生成下载 URL）
const SERVICE_BASE_URL = process.env.SERVICE_BASE_URL || 'test.sheepwall.com'
const UPLOAD_PRIVATE_ADDR = process.env.UPLOAD_PRIVATE_ADDR || '10.8.0.1:37900'

// OSS 客户端单例缓存（按 bucket 存储）
const clientCache = new Map<string, OSS>()

// 无 bucket 客户端的单例 key
const CLIENT_WITHOUT_BUCKET_KEY = '__NO_BUCKET__'

/**
 * 创建 OSS 客户端实例（用于指定 bucket 的操作）
 * 使用单例模式：相同的 bucket 会复用同一个客户端实例
 */
export function createOssClient(bucket: string): OSS {
    if (clientCache.has(bucket)) {
        return clientCache.get(bucket)!
    }
    const endpoint = getOssEndpoint()
    const region = endpoint.replace('https://', '').replace('.aliyuncs.com', '')

    const config: OSS.Options & { authorizationV4?: boolean } = {
        region,
        accessKeyId: getOssAccessKeyId(),
        accessKeySecret: getOssAccessKeySecret(),
        bucket,
        secure: true,
        timeout: 60000,
        authorizationV4: true,
    }

    const client = new OSS(config)
    clientCache.set(bucket, client)
    return client
}

/**
 * 验证 bucket 是否在允许列表中
 */
export function isValidBucket(bucket: string): boolean {
    return ALLOWED_BUCKETS.includes(bucket)
}

/**
 * 生成下载 URL
 */
export function generateDownloadUrl(bucket: string, bucketPath: string): string {
    // 移除开头的斜杠
    let path = bucketPath
    if (path.startsWith('/')) {
        path = path.substring(1)
    }

    // 移除 "apps" 前缀（如果存在）
    if (path.startsWith('apps')) {
        path = path.substring(5)
    }

    let downloadUrl: string

    // 根据 bucket 类型生成不同的 URL
    if (bucket.includes('public')) {
        downloadUrl = `https://${SERVICE_BASE_URL}/${path}`
    } else if (bucket.includes('protect')) {
        downloadUrl = `https://${SERVICE_BASE_URL}/p/${path}`
    } else if (bucket.includes('private')) {
        downloadUrl = `https://${UPLOAD_PRIVATE_ADDR}/${path}`
    } else {
        // 默认使用 public 格式
        downloadUrl = `https://${SERVICE_BASE_URL}/${path}`
    }

    return downloadUrl
}

/**
 * 上传文件到 OSS
 */
export async function uploadToOss(
    bucket: string,
    bucketPath: string,
    fileContent: Buffer | Uint8Array,
    options?: { contentType?: string }
): Promise<string> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    const client = createOssClient(bucket)
    const putOptions: OSS.PutObjectOptions = {}

    // if (options?.contentType) {
    //   putOptions.mime = options.contentType // ali-oss uses 'mime' or 'headers: { "Content-Type": ... }'
    // }

    try {
        const result = await client.put(bucketPath, Buffer.from(fileContent), putOptions)

        if (!result || !result.url) {
            throw new Error('Upload failed: No URL returned from OSS')
        }

        return generateDownloadUrl(bucket, bucketPath)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`OSS Upload failed: ${errorMessage}`)
    }
}

/**
 * 创建 OSS 客户端实例（用于不指定 bucket 的操作，如列举所有 bucket）
 */
function createOssClientWithoutBucket(): OSS {
    if (clientCache.has(CLIENT_WITHOUT_BUCKET_KEY)) {
        return clientCache.get(CLIENT_WITHOUT_BUCKET_KEY)!
    }

    const endpoint = getOssEndpoint()
    const region = endpoint.replace('https://', '').replace('.aliyuncs.com', '')

    const config: OSS.Options & { authorizationV4?: boolean } = {
        region,
        accessKeyId: getOssAccessKeyId(),
        accessKeySecret: getOssAccessKeySecret(),
        secure: true,
        timeout: 60000,
        authorizationV4: true,
    }

    const client = new OSS(config)
    clientCache.set(CLIENT_WITHOUT_BUCKET_KEY, client)
    return client
}

/**
 * 列举所有 bucket 列表
 */
export async function listBuckets(): Promise<OSS.Bucket[]> {
    try {
        const client = createOssClientWithoutBucket()
        const result = await client.listBuckets({})
        if (Array.isArray(result)) {
            return result
        }
        return (result as any).buckets || []
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`List buckets failed: ${errorMessage}`)
    }
}

/**
 * 获取 bucket 信息
 */
export async function getBucketInfo(bucket: string): Promise<any> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)
        const result = await client.getBucketInfo(bucket)
        return result.bucket || result
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Get bucket info failed: ${errorMessage}`)
    }
}

/**
 * 从 OSS 下载文件
 */
export async function downloadFromOss(bucket: string, objectPath: string): Promise<Buffer> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)
        const result = await client.get(objectPath)

        if (!result.content) {
            throw new Error('Download failed: Empty content')
        }

        if (Buffer.isBuffer(result.content)) {
            return result.content
        }
        return Buffer.from(result.content)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Download failed: ${errorMessage}`)
    }
}

/**
 * 列举文件列表
 */
export async function listObjects(
    bucket: string,
    options?: {
        maxKeys?: number
        continuationToken?: string
        prefix?: string
    }
): Promise<{
    objects: OSS.ObjectMeta[]
    nextContinuationToken?: string
}> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)
        const listOptions: OSS.ListV2ObjectsQuery = {}

        if (options?.maxKeys) {
            listOptions['max-keys'] = options.maxKeys
        }

        if (options?.continuationToken) {
            listOptions['continuation-token'] = options.continuationToken
        }

        if (options?.prefix) {
            listOptions.prefix = options.prefix
        }

        const result = await client.listV2(listOptions)

        return {
            objects: result.objects || [],
            nextContinuationToken: (result as any).nextContinuationToken,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`List objects failed: ${errorMessage}`)
    }
}

/**
 * 重命名文件（通过复制和删除实现）
 */
export async function renameObject(bucket: string, sourcePath: string, destPath: string): Promise<void> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)
        await client.copy(destPath, sourcePath)
        await client.delete(sourcePath)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Rename object failed: ${errorMessage}`)
    }
}

/**
 * 删除文件
 */
export async function deleteObject(bucket: string, objectPath: string): Promise<void> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)
        await client.delete(objectPath)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Delete object failed: ${errorMessage}`)
    }
}

/**
 * 创建软链接
 */
export async function putSymlink(
    bucket: string,
    symlinkPath: string,
    targetPath: string,
    options?: {
        storageClass?: string
        objectAcl?: string
        forbidOverwrite?: boolean
    }
): Promise<void> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)

        const headers: Record<string, string> = {}
        if (options?.storageClass) {
            headers['x-oss-storage-class'] = options.storageClass
        }
        if (options?.objectAcl) {
            headers['x-oss-object-acl'] = options.objectAcl
        }
        if (options?.forbidOverwrite !== undefined) {
            headers['x-oss-forbid-overwrite'] = options.forbidOverwrite ? 'true' : 'false'
        }

        await (client as any).putSymlink(symlinkPath, targetPath, { headers })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Put symlink failed: ${errorMessage}`)
    }
}

/**
 * 生成预签名 URL
 */
export async function generateSignatureUrl(
    bucket: string,
    objectPath: string,
    expires: number = 3600,
    method: 'GET' | 'PUT' | 'POST' | 'DELETE' = 'GET'
): Promise<string> {
    if (!isValidBucket(bucket)) {
        throw new Error(`Bucket "${bucket}" is not in the allowed list`)
    }

    try {
        const client = createOssClient(bucket)
        const signUrl = await (client as any).signatureUrlV4(
            method,
            expires,
            {
                headers: {},
            },
            objectPath
        )

        return signUrl
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Generate signature URL failed: ${errorMessage}`)
    }
}
