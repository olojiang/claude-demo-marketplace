import { readFileSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'

const BASE_URL = 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource'
export const DEFAULT_APP_ID = 'pinefield.assets'
export const CONSOLE_URL = 'https://app.pinefield.cn/pinefield.developer-console/#/'
export const CDN_DOMAIN = 'https://assets.pinefield.cn'

/**
 * 将原始 CDN URL 转换为 webp 格式 URL（阿里云 OSS 图片处理）。
 * 非图片或空 URL 原样返回。
 * @param {string} url
 * @returns {string}
 */
export function buildWebpUrl(url) {
  if (!url) return ''
  return `${url}?x-oss-process=image/format,webp`
}

/** manifest.json 中应用 id 的路径，相对于项目根目录 */
export const MANIFEST_PATH = 'src/manifest.json'

/**
 * @typedef {{ name: string; path: string; type: 'file'; size: number; lastModified: string; url: string }} ResourceFile
 * @typedef {{ name: string; path: string; type: 'directory'; children: ResourceNode[] }} ResourceDir
 * @typedef {ResourceFile | ResourceDir} ResourceNode
 * @typedef {{ url: string; name: string; path: string }} UploadResult
 */

export function getToken() {
  const token = process.env.PF_SESSION_TOKEN
  if (!token) {
    throw new Error(
      '环境变量 PF_SESSION_TOKEN 未设置。\n请先运行: export PF_SESSION_TOKEN="your-token"',
    )
  }
  return token
}

/**
 * 从项目根目录下的 src/manifest.json 读取 appId（即 id 字段）。
 * 若文件不存在、目录不存在、或内容中无 id，回退到默认 appId。
 * @param {string} [projectRoot=process.cwd()] 项目根目录
 * @returns {string}
 */
export function getAppIdFromManifest(projectRoot = process.cwd()) {
  const manifestPath = join(projectRoot, MANIFEST_PATH)
  if (!existsSync(manifestPath)) {
    return DEFAULT_APP_ID
  }
  try {
    const content = readFileSync(manifestPath, 'utf-8')
    const data = JSON.parse(content)
    if (typeof data?.id === 'string' && data.id.trim() !== '') {
      return data.id.trim()
    }
    return DEFAULT_APP_ID
  } catch {
    return DEFAULT_APP_ID
  }
}

/**
 * @param {ResourceNode[]} tree
 * @param {string} appId
 * @returns {ResourceDir | null}
 */
export function findAppDir(tree, appId) {
  for (const node of tree) {
    if (node.type === 'directory' && node.name === 'apps') {
      for (const child of node.children) {
        if (child.type === 'directory' && child.name === appId) {
          return child
        }
      }
    }
  }
  return null
}

/**
 * @param {ResourceNode[]} nodes
 * @returns {ResourceFile[]}
 */
export function flattenFiles(nodes) {
  const files = []
  for (const node of nodes) {
    if (node.type === 'file') {
      files.push(node)
    } else if (node.type === 'directory') {
      files.push(...flattenFiles(node.children || []))
    }
  }
  return files
}

/**
 * 规范化 apps/<appId>/ 下的子目录路径（不含 appId 前缀）。
 * 接受 "foo/bar"、"/foo/bar/"；拒绝含 . 或 .. 的路径段。
 * @param {string | undefined | null} subPath
 * @returns {string} 无首尾斜杠；空则返回 ''
 */
export function normalizeSubPath(subPath) {
  if (subPath == null || typeof subPath !== 'string') {
    return ''
  }
  const trimmed = subPath.trim()
  if (trimmed === '') {
    return ''
  }
  const parts = trimmed.split('/').filter(Boolean)
  for (const p of parts) {
    if (p === '..' || p === '.') {
      throw new Error('subPath 不允许包含 . 或 .. 路径段')
    }
  }
  return parts.join('/')
}

/**
 * @param {string} appId
 * @param {string} normalizedSubPath normalizeSubPath 的返回值
 * @returns {string} 上传表单 dir 字段，如 /apps/foo 或 /apps/foo/bar/baz
 */
export function buildUploadDir(appId, normalizedSubPath) {
  const base = `/apps/${appId}`
  return normalizedSubPath ? `${base}/${normalizedSubPath}` : base
}

/**
 * @param {string} appId
 * @param {string} fileName
 * @param {string} normalizedSubPath normalizeSubPath 的返回值
 * @returns {string} detail 接口用的 path，如 apps/foo/bar.png
 */
export function buildResourcePath(appId, fileName, normalizedSubPath) {
  return normalizedSubPath
    ? `apps/${appId}/${normalizedSubPath}/${fileName}`
    : `apps/${appId}/${fileName}`
}

/**
 * @param {ResourceDir} dirNode
 * @param {string[]} segments 路径段，如 ['images','icons']
 * @returns {ResourceDir | null}
 */
function findNestedDir(dirNode, segments) {
  if (segments.length === 0) {
    return dirNode
  }
  const [head, ...rest] = segments
  const children = dirNode.children || []
  const next = children.find(
    (n) => n.type === 'directory' && n.name === head,
  )
  if (!next || next.type !== 'directory') {
    return null
  }
  return findNestedDir(next, rest)
}

/**
 * @param {string} appId
 * @param {string} filePath
 * @param {string} [subPath] 可选，上传到 apps/<appId>/<subPath>/ 下；不传则与原先一致（直接放在 app 根下）
 * @returns {Promise<UploadResult>}
 */
export async function uploadResource(appId, filePath, subPath) {
  const token = getToken()
  const normalizedSub = normalizeSubPath(subPath)
  const fileName = basename(filePath)
  const fileBuffer = readFileSync(filePath)
  const blob = new Blob([fileBuffer])

  const formData = new FormData()
  formData.append('files', blob, fileName)
  formData.append('dir', buildUploadDir(appId, normalizedSub))

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text()
    throw new Error(`上传失败: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`)
  }

  const resourcePath = buildResourcePath(appId, fileName, normalizedSub)
  const detailRes = await fetch(`${BASE_URL}/detail?path=${encodeURIComponent(resourcePath)}`, {
    headers: { authorization: `Bearer ${token}` },
  })

  if (!detailRes.ok) {
    throw new Error(`获取资源详情失败: ${detailRes.status}`)
  }

  const detail = await detailRes.json()
  return {
    url: detail.url,
    webpUrl: detail.webpUrl || buildWebpUrl(detail.url),
    name: detail.name,
    path: detail.path,
  }
}

/**
 * 查询已有资源的 CDN 链接（不上传），通过 detail 接口获取 url / webpUrl。
 * @param {string} appId
 * @param {string} fileName
 * @param {string} [subPath]
 * @returns {Promise<{url: string; webpUrl: string; name: string; path: string}>}
 */
export async function getResourceDetail(appId, fileName, subPath) {
  const token = getToken()
  const normalizedSub = normalizeSubPath(subPath)
  const resourcePath = buildResourcePath(appId, fileName, normalizedSub)

  const detailRes = await fetch(
    `${BASE_URL}/detail?path=${encodeURIComponent(resourcePath)}`,
    { headers: { authorization: `Bearer ${token}` } },
  )

  if (!detailRes.ok) {
    throw new Error(`获取资源详情失败: ${detailRes.status}`)
  }

  const detail = await detailRes.json()
  return {
    url: detail.url,
    webpUrl: detail.webpUrl || buildWebpUrl(detail.url),
    name: detail.name,
    path: detail.path,
  }
}

/**
 * 格式化上传/查询结果的输出文本（含 webp 链接和控制台链接）。
 * @param {Array<{url: string; webpUrl: string; name: string; path: string}>} results
 * @returns {string}
 */
export function formatResultOutput(results) {
  const lines = []
  for (const r of results) {
    lines.push(`${r.name}`)
    lines.push(`  URL:  ${r.url}`)
    lines.push(`  WebP: ${r.webpUrl}`)
  }
  lines.push('')
  lines.push(`Resource Console: ${CONSOLE_URL}`)
  return lines.join('\n')
}

/**
 * @param {string} appId
 * @param {string} [subPath] 可选，只列出 apps/<appId>/<subPath>/ 下的文件（递归展平）；不传则列出整个 app 目录下所有文件
 * @returns {Promise<ResourceFile[]>}
 */
export async function listResources(appId, subPath) {
  const token = getToken()
  const normalizedSub = normalizeSubPath(subPath)

  const response = await fetch(`${BASE_URL}/list`, {
    headers: { authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`获取资源列表失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const appDir = findAppDir(data.tree, appId)

  if (!appDir) {
    return []
  }

  const segments = normalizedSub ? normalizedSub.split('/') : []
  const targetDir = segments.length ? findNestedDir(appDir, segments) : appDir
  if (!targetDir) {
    return []
  }

  return flattenFiles(targetDir.children || [])
}
