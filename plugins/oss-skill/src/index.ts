#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import {
    uploadToOss,
    downloadFromOss,
    listBuckets,
    getBucketInfo,
    listObjects,
    deleteObject,
    renameObject,
    putSymlink,
    generateSignatureUrl,
} from './lib/oss-client.js'

const program = new Command()

program
    .name('oss-skill')
    .description('OSS Skill for Claude Code')
    .version('1.0.0')

program
    .command('list-buckets')
    .description('List all available buckets')
    .action(async () => {
        try {
            const buckets = await listBuckets()
            console.log(JSON.stringify(buckets, null, 2))
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('bucket-info')
    .description('Get bucket information')
    .argument('<bucket>', 'Bucket name')
    .action(async (bucket) => {
        try {
            const info = await getBucketInfo(bucket)
            console.log(JSON.stringify(info, null, 2))
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('upload')
    .description('Upload a file to OSS')
    .argument('<bucket>', 'Bucket name')
    .argument('<localPath>', 'Local file path')
    .argument('<remotePath>', 'Remote OSS path')
    .action(async (bucket, localPath, remotePath) => {
        try {
            if (!fs.existsSync(localPath)) {
                throw new Error(`File not found: ${localPath}`)
            }
            const content = fs.readFileSync(localPath)
            const url = await uploadToOss(bucket, remotePath, content)
            console.log(JSON.stringify({ url, status: 'success' }, null, 2))
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('download')
    .description('Download a file from OSS')
    .argument('<bucket>', 'Bucket name')
    .argument('<remotePath>', 'Remote OSS path')
    .argument('[localPath]', 'Local file path to save')
    .action(async (bucket, remotePath, localPath) => {
        try {
            const content = await downloadFromOss(bucket, remotePath)
            if (localPath) {
                const dir = path.dirname(localPath)
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }
                fs.writeFileSync(localPath, content)
                console.log(`Downloaded to ${localPath}`)
            } else {
                process.stdout.write(content)
            }
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('list-objects')
    .description('List objects in a bucket')
    .argument('<bucket>', 'Bucket name')
    .option('-m, --max-keys <number>', 'Max keys', parseInt)
    .option('-p, --prefix <string>', 'Filter prefix')
    .option('-c, --continuation-token <string>', 'Continuation token')
    .action(async (bucket, options) => {
        try {
            const result = await listObjects(bucket, options)
            console.log(JSON.stringify(result, null, 2))
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('delete')
    .description('Delete an object from OSS')
    .argument('<bucket>', 'Bucket name')
    .argument('<remotePath>', 'Remote OSS path')
    .action(async (bucket, remotePath) => {
        try {
            await deleteObject(bucket, remotePath)
            console.log(`Deleted ${remotePath} from ${bucket}`)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('rename')
    .description('Rename an object in OSS')
    .argument('<bucket>', 'Bucket name')
    .argument('<oldPath>', 'Old remote path')
    .argument('<newPath>', 'New remote path')
    .action(async (bucket, oldPath, newPath) => {
        try {
            await renameObject(bucket, oldPath, newPath)
            console.log(`Renamed ${oldPath} to ${newPath} in ${bucket}`)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('symlink')
    .description('Create a symlink in OSS')
    .argument('<bucket>', 'Bucket name')
    .argument('<symlinkPath>', 'Symlink path')
    .argument('<targetPath>', 'Target path')
    .action(async (bucket, symlinkPath, targetPath) => {
        try {
            await putSymlink(bucket, symlinkPath, targetPath)
            console.log(`Created symlink ${symlinkPath} -> ${targetPath} in ${bucket}`)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program
    .command('sign-url')
    .description('Generate a signed URL')
    .argument('<bucket>', 'Bucket name')
    .argument('<remotePath>', 'Remote OSS path')
    .option('-e, --expires <seconds>', 'Expiration in seconds', parseInt, 3600)
    .option('-M, --method <string>', 'HTTP method', 'GET')
    .action(async (bucket, remotePath, options) => {
        try {
            const url = await generateSignatureUrl(bucket, remotePath, options.expires, options.method as any)
            console.log(url)
        } catch (error) {
            console.error(error)
            process.exit(1)
        }
    })

program.parse()
