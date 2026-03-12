#!/usr/bin/env node
import { Command } from 'commander';
import { MinioService, MinioConfig } from './lib/minio-client.js';
import { z } from 'zod';
import path from 'path';

const program = new Command();

const configSchema = z.object({
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.string().transform(Number).optional(),
    MINIO_USE_SSL: z.string().transform((v) => v === 'true').optional(),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
});

function getService() {
    const env = configSchema.parse(process.env);
    const config: MinioConfig = {
        endPoint: env.MINIO_ENDPOINT,
        port: env.MINIO_PORT || 9000,
        useSSL: env.MINIO_USE_SSL || false,
        accessKey: env.MINIO_ACCESS_KEY,
        secretKey: env.MINIO_SECRET_KEY,
    };
    return new MinioService(config);
}

program
    .name('minio-skill')
    .description('MinIO Skill for Claude Code')
    .version('1.0.0');

program.command('list')
    .alias('ls')
    .description('List buckets or objects')
    .argument('[bucket]', 'Bucket name')
    .argument('[prefix]', 'Object prefix')
    .option('-r, --recursive', 'Recursive list', false)
    .action(async (bucket, prefix, options) => {
        try {
            const service = getService();
            if (!bucket) {
                const buckets = await service.listBuckets();
                console.table(buckets.map(b => ({ name: b.name, created: b.creationDate })));
            } else {
                const objects = await service.listObjects(bucket, prefix || '', options.recursive);
                console.table(objects.map(o => ({ name: o.name, size: o.size, lastModified: o.lastModified })));
            }
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program.command('upload')
    .alias('cp-in')
    .description('Upload a file')
    .argument('<bucket>', 'Bucket name')
    .argument('<object>', 'Object name')
    .argument('<file>', 'File path')
    .action(async (bucket, object, file) => {
        try {
            const service = getService();
            const absPath = path.resolve(file);
            await service.uploadFile(bucket, object, absPath);
            console.log(`Uploaded ${file} to ${bucket}/${object}`);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program.command('download')
    .alias('cp-out')
    .description('Download a file')
    .argument('<bucket>', 'Bucket name')
    .argument('<object>', 'Object name')
    .argument('<file>', 'Destination file path')
    .action(async (bucket, object, file) => {
        try {
            const service = getService();
            const absPath = path.resolve(file);
            await service.downloadFile(bucket, object, absPath);
            console.log(`Downloaded ${bucket}/${object} to ${file}`);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program.command('delete')
    .alias('rm')
    .description('Delete an object')
    .argument('<bucket>', 'Bucket name')
    .argument('<object>', 'Object name')
    .action(async (bucket, object) => {
        try {
            const service = getService();
            await service.removeObject(bucket, object);
            console.log(`Deleted ${bucket}/${object}`);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    });

program.parse();
