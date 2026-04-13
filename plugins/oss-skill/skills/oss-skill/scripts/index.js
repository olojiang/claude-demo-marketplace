#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import OSS from 'ali-oss';
import dotenv from 'dotenv';

// src/lib/config.ts
var DEFAULT_OSS_ENDPOINT = "https://oss-cn-zhangjiakou.aliyuncs.com";
var DEFAULT_ALLOWED_BUCKETS = [
  "pf-test-public-web",
  "pf-test-public-file",
  "pf-test-protect-web",
  "pf-test-protect-file",
  "pf-test-private-web",
  "pf-test-private-file"
];

// src/lib/oss-client.ts
dotenv.config();
function getOssEndpoint() {
  return process.env.OSS_ENDPOINT || DEFAULT_OSS_ENDPOINT;
}
function getOssAccessKeyId() {
  const key = process.env.OSS_ACCESS_KEY_ID || process.env.DORAEMON_OSSACCESSKEY;
  if (!key) {
    throw new Error("OSS_ACCESS_KEY_ID environment variable is not set");
  }
  return key;
}
function getOssAccessKeySecret() {
  const secret = process.env.OSS_ACCESS_KEY_SECRET || process.env.DORAEMON_OSSACCESSSECRET;
  if (!secret) {
    throw new Error("OSS_ACCESS_KEY_SECRET environment variable is not set");
  }
  return secret;
}
var ALLOWED_BUCKETS = process.env.ALLOWED_BUCKETS ? process.env.ALLOWED_BUCKETS.split(",") : DEFAULT_ALLOWED_BUCKETS;
var SERVICE_BASE_URL = process.env.SERVICE_BASE_URL || "test.sheepwall.com";
var UPLOAD_PRIVATE_ADDR = process.env.UPLOAD_PRIVATE_ADDR || "10.8.0.1:37900";
var clientCache = /* @__PURE__ */ new Map();
var CLIENT_WITHOUT_BUCKET_KEY = "__NO_BUCKET__";
function createOssClient(bucket) {
  if (clientCache.has(bucket)) {
    return clientCache.get(bucket);
  }
  const endpoint = getOssEndpoint();
  const region = endpoint.replace("https://", "").replace(".aliyuncs.com", "");
  const config = {
    region,
    accessKeyId: getOssAccessKeyId(),
    accessKeySecret: getOssAccessKeySecret(),
    bucket,
    secure: true,
    timeout: 6e4,
    authorizationV4: true
  };
  const client = new OSS(config);
  clientCache.set(bucket, client);
  return client;
}
function isValidBucket(bucket) {
  return ALLOWED_BUCKETS.includes(bucket);
}
function generateDownloadUrl(bucket, bucketPath) {
  let path2 = bucketPath;
  if (path2.startsWith("/")) {
    path2 = path2.substring(1);
  }
  if (path2.startsWith("apps")) {
    path2 = path2.substring(5);
  }
  let downloadUrl;
  if (bucket.includes("public")) {
    downloadUrl = `https://${SERVICE_BASE_URL}/${path2}`;
  } else if (bucket.includes("protect")) {
    downloadUrl = `https://${SERVICE_BASE_URL}/p/${path2}`;
  } else if (bucket.includes("private")) {
    downloadUrl = `https://${UPLOAD_PRIVATE_ADDR}/${path2}`;
  } else {
    downloadUrl = `https://${SERVICE_BASE_URL}/${path2}`;
  }
  return downloadUrl;
}
async function uploadToOss(bucket, bucketPath, fileContent, options) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  const client = createOssClient(bucket);
  const putOptions = {};
  try {
    const result = await client.put(bucketPath, Buffer.from(fileContent), putOptions);
    if (!result || !result.url) {
      throw new Error("Upload failed: No URL returned from OSS");
    }
    return generateDownloadUrl(bucket, bucketPath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`OSS Upload failed: ${errorMessage}`);
  }
}
function createOssClientWithoutBucket() {
  if (clientCache.has(CLIENT_WITHOUT_BUCKET_KEY)) {
    return clientCache.get(CLIENT_WITHOUT_BUCKET_KEY);
  }
  const endpoint = getOssEndpoint();
  const region = endpoint.replace("https://", "").replace(".aliyuncs.com", "");
  const config = {
    region,
    accessKeyId: getOssAccessKeyId(),
    accessKeySecret: getOssAccessKeySecret(),
    secure: true,
    timeout: 6e4,
    authorizationV4: true
  };
  const client = new OSS(config);
  clientCache.set(CLIENT_WITHOUT_BUCKET_KEY, client);
  return client;
}
async function listBuckets() {
  try {
    const client = createOssClientWithoutBucket();
    const result = await client.listBuckets({});
    if (Array.isArray(result)) {
      return result;
    }
    return result.buckets || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`List buckets failed: ${errorMessage}`);
  }
}
async function getBucketInfo(bucket) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    const result = await client.getBucketInfo(bucket);
    return result.bucket || result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Get bucket info failed: ${errorMessage}`);
  }
}
async function downloadFromOss(bucket, objectPath) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    const result = await client.get(objectPath);
    if (!result.content) {
      throw new Error("Download failed: Empty content");
    }
    if (Buffer.isBuffer(result.content)) {
      return result.content;
    }
    return Buffer.from(result.content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Download failed: ${errorMessage}`);
  }
}
async function listObjects(bucket, options) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    const listOptions = {};
    if (options?.maxKeys) {
      listOptions["max-keys"] = options.maxKeys;
    }
    if (options?.continuationToken) {
      listOptions["continuation-token"] = options.continuationToken;
    }
    if (options?.prefix) {
      listOptions.prefix = options.prefix;
    }
    const result = await client.listV2(listOptions);
    return {
      objects: result.objects || [],
      nextContinuationToken: result.nextContinuationToken
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`List objects failed: ${errorMessage}`);
  }
}
async function renameObject(bucket, sourcePath, destPath) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    await client.copy(destPath, sourcePath);
    await client.delete(sourcePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Rename object failed: ${errorMessage}`);
  }
}
async function deleteObject(bucket, objectPath) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    await client.delete(objectPath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Delete object failed: ${errorMessage}`);
  }
}
async function putSymlink(bucket, symlinkPath, targetPath, options) {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    const headers = {};
    if (options?.storageClass) ;
    if (options?.objectAcl) ;
    if (options?.forbidOverwrite !== void 0) ;
    await client.putSymlink(symlinkPath, targetPath, { headers });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Put symlink failed: ${errorMessage}`);
  }
}
async function generateSignatureUrl(bucket, objectPath, expires = 3600, method = "GET") {
  if (!isValidBucket(bucket)) {
    throw new Error(`Bucket "${bucket}" is not in the allowed list`);
  }
  try {
    const client = createOssClient(bucket);
    const signUrl = await client.signatureUrlV4(
      method,
      expires,
      {
        headers: {}
      },
      objectPath
    );
    return signUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Generate signature URL failed: ${errorMessage}`);
  }
}

// src/index.ts
var program = new Command();
program.name("oss-skill").description("OSS Skill for Claude Code").version("1.0.0");
program.command("list-buckets").description("List all available buckets").action(async () => {
  try {
    const buckets = await listBuckets();
    console.log(JSON.stringify(buckets, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("bucket-info").description("Get bucket information").argument("<bucket>", "Bucket name").action(async (bucket) => {
  try {
    const info = await getBucketInfo(bucket);
    console.log(JSON.stringify(info, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("upload").description("Upload a file to OSS").argument("<bucket>", "Bucket name").argument("<localPath>", "Local file path").argument("<remotePath>", "Remote OSS path").action(async (bucket, localPath, remotePath) => {
  try {
    if (!fs.existsSync(localPath)) {
      throw new Error(`File not found: ${localPath}`);
    }
    const content = fs.readFileSync(localPath);
    const url = await uploadToOss(bucket, remotePath, content);
    console.log(JSON.stringify({ url, status: "success" }, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("download").description("Download a file from OSS").argument("<bucket>", "Bucket name").argument("<remotePath>", "Remote OSS path").argument("[localPath]", "Local file path to save").action(async (bucket, remotePath, localPath) => {
  try {
    const content = await downloadFromOss(bucket, remotePath);
    if (localPath) {
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(localPath, content);
      console.log(`Downloaded to ${localPath}`);
    } else {
      process.stdout.write(content);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("list-objects").description("List objects in a bucket").argument("<bucket>", "Bucket name").option("-m, --max-keys <number>", "Max keys", parseInt).option("-p, --prefix <string>", "Filter prefix").option("-c, --continuation-token <string>", "Continuation token").action(async (bucket, options) => {
  try {
    const result = await listObjects(bucket, options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("delete").description("Delete an object from OSS").argument("<bucket>", "Bucket name").argument("<remotePath>", "Remote OSS path").action(async (bucket, remotePath) => {
  try {
    await deleteObject(bucket, remotePath);
    console.log(`Deleted ${remotePath} from ${bucket}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("rename").description("Rename an object in OSS").argument("<bucket>", "Bucket name").argument("<oldPath>", "Old remote path").argument("<newPath>", "New remote path").action(async (bucket, oldPath, newPath) => {
  try {
    await renameObject(bucket, oldPath, newPath);
    console.log(`Renamed ${oldPath} to ${newPath} in ${bucket}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("symlink").description("Create a symlink in OSS").argument("<bucket>", "Bucket name").argument("<symlinkPath>", "Symlink path").argument("<targetPath>", "Target path").action(async (bucket, symlinkPath, targetPath) => {
  try {
    await putSymlink(bucket, symlinkPath, targetPath);
    console.log(`Created symlink ${symlinkPath} -> ${targetPath} in ${bucket}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.command("sign-url").description("Generate a signed URL").argument("<bucket>", "Bucket name").argument("<remotePath>", "Remote OSS path").option("-e, --expires <seconds>", "Expiration in seconds", parseInt, 3600).option("-M, --method <string>", "HTTP method", "GET").action(async (bucket, remotePath, options) => {
  try {
    const url = await generateSignatureUrl(bucket, remotePath, options.expires, options.method);
    console.log(url);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
program.parse();
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map