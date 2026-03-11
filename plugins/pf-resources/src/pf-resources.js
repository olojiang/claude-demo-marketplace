import { readFileSync, existsSync } from 'node:fs'
import { basename, join } from 'node:path'

const BASE_URL = 'https://test.sheepwall.com/fe-dash/api/oss/aliyun/resource'

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
 * 若文件不存在、目录不存在、或内容中无 id，返回 null，此时应主动询问用户 appId。
 * @param {string} [projectRoot=process.cwd()] 项目根目录
 * @returns {string | null}
 */
export function getAppIdFromManifest(projectRoot = process.cwd()) {
  const manifestPath = join(projectRoot, MANIFEST_PATH)
  if (!existsSync(manifestPath)) {
    return null
  }
  try {
    const content = readFileSync(manifestPath, 'utf-8')
    const data = JSON.parse(content)
    if (typeof data?.id === 'string' && data.id.trim() !== '') {
      return data.id.trim()
    }
    return null
  } catch {
    return null
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
 * @param {string} appId
 * @param {string} filePath
 * @returns {Promise<UploadResult>}
 */
export async function uploadResource(appId, filePath) {
  const token = getToken()
  const fileName = basename(filePath)
  const fileBuffer = readFileSync(filePath)
  const blob = new Blob([fileBuffer])

  const formData = new FormData()
  formData.append('files', blob, fileName)
  formData.append('dir', `/apps/${appId}`)

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text()
    throw new Error(`上传失败: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`)
  }

  const resourcePath = `apps/${appId}/${fileName}`
  const detailRes = await fetch(`${BASE_URL}/detail?path=${encodeURIComponent(resourcePath)}`, {
    headers: { authorization: `Bearer ${token}` },
  })

  if (!detailRes.ok) {
    throw new Error(`获取资源详情失败: ${detailRes.status}`)
  }

  const detail = await detailRes.json()
  return { url: detail.url, name: detail.name, path: detail.path }
}

/**
 * @param {string} appId
 * @returns {Promise<ResourceFile[]>}
 */
export async function listResources(appId) {
  const token = getToken()

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

  return flattenFiles(appDir.children || [])
}
