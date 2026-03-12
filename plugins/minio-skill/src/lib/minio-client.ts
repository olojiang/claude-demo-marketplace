import * as Minio from 'minio'

export interface MinioConfig {
    endPoint: string
    port?: number
    useSSL?: boolean
    accessKey: string
    secretKey: string
}

export class MinioService {
    private client: Minio.Client

    constructor(config: MinioConfig) {
        this.client = new Minio.Client(config)
    }

    async listBuckets(): Promise<Minio.BucketItemFromList[]> {
        return this.client.listBuckets()
    }

    async listObjects(bucketName: string, prefix: string = '', recursive: boolean = false): Promise<Minio.BucketItem[]> {
        return new Promise((resolve, reject) => {
            const stream = this.client.listObjects(bucketName, prefix, recursive)
            const objects: Minio.BucketItem[] = []
            stream.on('data', (obj) => objects.push(obj))
            stream.on('end', () => resolve(objects))
            stream.on('error', (err) => reject(err))
        })
    }

    async uploadFile(bucketName: string, objectName: string, filePath: string, metaData: Minio.ItemBucketMetadata = {}): Promise<Minio.UploadedObjectInfo> {
        return this.client.fPutObject(bucketName, objectName, filePath, metaData)
    }

    async downloadFile(bucketName: string, objectName: string, filePath: string): Promise<void> {
        await this.client.fGetObject(bucketName, objectName, filePath)
    }

    async removeObject(bucketName: string, objectName: string): Promise<void> {
        await this.client.removeObject(bucketName, objectName)
    }
}
