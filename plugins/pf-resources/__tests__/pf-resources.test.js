import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getToken,
  getAppIdFromManifest,
  findAppDir,
  flattenFiles,
  uploadResource,
  listResources,
  MANIFEST_PATH,
} from '../src/pf-resources.js'
import { existsSync, readFileSync } from 'node:fs'

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn(() => Buffer.from('fake-image-data')),
  }
})

describe('pf-resources', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('getToken', () => {
    it('PF_SESSION_TOKEN 未设置时应抛出错误', () => {
      delete process.env.PF_SESSION_TOKEN
      expect(() => getToken()).toThrow('PF_SESSION_TOKEN')
    })

    it('PF_SESSION_TOKEN 已设置时应返回 token', () => {
      process.env.PF_SESSION_TOKEN = 'test-token-123'
      expect(getToken()).toBe('test-token-123')
    })
  })

  describe('getAppIdFromManifest', () => {
    it('MANIFEST_PATH 应为 src/manifest.json', () => {
      expect(MANIFEST_PATH).toBe('src/manifest.json')
    })

    it('文件不存在时应返回 null', () => {
      vi.mocked(existsSync).mockReturnValueOnce(false)
      expect(getAppIdFromManifest('/project')).toBeNull()
    })

    it('存在且 id 有效时应返回 id 字符串', () => {
      vi.mocked(existsSync).mockReturnValueOnce(true)
      vi.mocked(readFileSync).mockReturnValueOnce(
        JSON.stringify({ id: 'pinefield.context-digital-native' }),
      )
      expect(getAppIdFromManifest('/project')).toBe('pinefield.context-digital-native')
    })

    it('id 前后空格应被 trim', () => {
      vi.mocked(existsSync).mockReturnValueOnce(true)
      vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify({ id: '  pinefield.my-app  ' }))
      expect(getAppIdFromManifest('/project')).toBe('pinefield.my-app')
    })

    it('无 id 字段时应返回 null', () => {
      vi.mocked(existsSync).mockReturnValueOnce(true)
      vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify({ type: '3rd' }))
      expect(getAppIdFromManifest('/project')).toBeNull()
    })

    it('id 为空字符串时应返回 null', () => {
      vi.mocked(existsSync).mockReturnValueOnce(true)
      vi.mocked(readFileSync).mockReturnValueOnce(JSON.stringify({ id: '' }))
      expect(getAppIdFromManifest('/project')).toBeNull()
    })

    it('JSON 解析失败时应返回 null', () => {
      vi.mocked(existsSync).mockReturnValueOnce(true)
      vi.mocked(readFileSync).mockReturnValueOnce('not json')
      expect(getAppIdFromManifest('/project')).toBeNull()
    })

    it('不传 projectRoot 时也能正常执行（文件不存在则返回 null）', () => {
      vi.mocked(existsSync).mockReturnValueOnce(false)
      expect(getAppIdFromManifest()).toBeNull()
    })
  })

  describe('findAppDir', () => {
    const mockTree = [
      {
        name: 'apps',
        path: 'apps/',
        type: 'directory',
        children: [
          {
            name: 'pinefield.context-digital-native',
            path: 'apps/pinefield.context-digital-native/',
            type: 'directory',
            children: [
              {
                name: 'test1.png',
                path: 'apps/pinefield.context-digital-native/test1.png',
                type: 'file',
                size: 36401,
                lastModified: '2026-03-11T07:06:53.000Z',
                url: 'https://assets.pinefield.cn/apps/pinefield.context-digital-native/test1.png',
              },
            ],
          },
          {
            name: 'pinefield.spacetop',
            path: 'apps/pinefield.spacetop/',
            type: 'directory',
            children: [],
          },
        ],
      },
      {
        name: 'shared',
        path: 'shared/',
        type: 'directory',
        children: [],
      },
    ]

    it('应根据 appId 找到对应目录', () => {
      const result = findAppDir(mockTree, 'pinefield.context-digital-native')
      expect(result).not.toBeNull()
      expect(result.name).toBe('pinefield.context-digital-native')
      expect(result.children).toHaveLength(1)
    })

    it('appId 不存在时应返回 null', () => {
      const result = findAppDir(mockTree, 'non-existent-app')
      expect(result).toBeNull()
    })

    it('apps 目录不存在时应返回 null', () => {
      const tree = [
        { name: 'shared', path: 'shared/', type: 'directory', children: [] },
      ]
      const result = findAppDir(tree, 'pinefield.context-digital-native')
      expect(result).toBeNull()
    })

    it('空树应返回 null', () => {
      expect(findAppDir([], 'any-app')).toBeNull()
    })
  })

  describe('flattenFiles', () => {
    it('应将嵌套树结构展平为文件列表', () => {
      const nodes = [
        {
          name: 'test1.png',
          path: 'apps/myapp/test1.png',
          type: 'file',
          size: 100,
          lastModified: '2026-01-01T00:00:00.000Z',
          url: 'https://assets.pinefield.cn/apps/myapp/test1.png',
        },
        {
          name: 'subdir',
          path: 'apps/myapp/subdir/',
          type: 'directory',
          children: [
            {
              name: 'test2.png',
              path: 'apps/myapp/subdir/test2.png',
              type: 'file',
              size: 200,
              lastModified: '2026-01-02T00:00:00.000Z',
              url: 'https://assets.pinefield.cn/apps/myapp/subdir/test2.png',
            },
          ],
        },
      ]

      const result = flattenFiles(nodes)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('test1.png')
      expect(result[1].name).toBe('test2.png')
    })

    it('空输入应返回空数组', () => {
      expect(flattenFiles([])).toEqual([])
    })

    it('应处理深层嵌套结构', () => {
      const nodes = [
        {
          name: 'a',
          path: 'a/',
          type: 'directory',
          children: [
            {
              name: 'b',
              path: 'a/b/',
              type: 'directory',
              children: [
                {
                  name: 'deep.png',
                  path: 'a/b/deep.png',
                  type: 'file',
                  size: 50,
                  lastModified: '2026-01-01T00:00:00.000Z',
                  url: 'https://assets.pinefield.cn/a/b/deep.png',
                },
              ],
            },
          ],
        },
      ]

      const result = flattenFiles(nodes)
      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('a/b/deep.png')
    })

    it('只包含目录时应返回空数组', () => {
      const nodes = [
        {
          name: 'empty-dir',
          path: 'empty-dir/',
          type: 'directory',
          children: [],
        },
      ]
      expect(flattenFiles(nodes)).toEqual([])
    })
  })

  describe('uploadResource', () => {
    it('应上传文件并通过 detail API 返回 URL', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: 'test.png',
            path: 'apps/myapp/test.png',
            url: 'https://assets.pinefield.cn/apps/myapp/test.png',
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await uploadResource('myapp', '/path/to/test.png')

      expect(result.url).toBe('https://assets.pinefield.cn/apps/myapp/test.png')
      expect(result.name).toBe('test.png')
      expect(result.path).toBe('apps/myapp/test.png')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('上传请求应包含正确的 authorization header 和 formData', async () => {
      process.env.PF_SESSION_TOKEN = 'my-token-abc'

      const mockFetch = vi.fn()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: 'img.png',
            path: 'apps/testapp/img.png',
            url: 'https://assets.pinefield.cn/apps/testapp/img.png',
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await uploadResource('testapp', '/some/dir/img.png')

      const [uploadUrl, uploadOpts] = mockFetch.mock.calls[0]
      expect(uploadUrl).toContain('/upload')
      expect(uploadOpts.headers.authorization).toBe('Bearer my-token-abc')
      expect(uploadOpts.method).toBe('POST')
      expect(uploadOpts.body).toBeInstanceOf(FormData)

      const [detailUrl, detailOpts] = mockFetch.mock.calls[1]
      expect(detailUrl).toContain('/detail')
      expect(detailUrl).toContain(encodeURIComponent('apps/testapp/img.png'))
      expect(detailOpts.headers.authorization).toBe('Bearer my-token-abc')
    })

    it('上传失败时应抛出错误', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(uploadResource('myapp', '/path/to/test.png')).rejects.toThrow('上传失败')
    })

    it('获取详情失败时应抛出错误', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(uploadResource('myapp', '/path/to/test.png')).rejects.toThrow('获取资源详情失败')
    })

    it('token 未设置时应抛出错误', async () => {
      delete process.env.PF_SESSION_TOKEN

      await expect(uploadResource('myapp', '/path/to/test.png')).rejects.toThrow('PF_SESSION_TOKEN')
    })
  })

  describe('listResources', () => {
    it('应返回指定 appId 下的资源列表', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tree: [
              {
                name: 'apps',
                path: 'apps/',
                type: 'directory',
                children: [
                  {
                    name: 'myapp',
                    path: 'apps/myapp/',
                    type: 'directory',
                    children: [
                      {
                        name: 'file1.png',
                        path: 'apps/myapp/file1.png',
                        type: 'file',
                        size: 100,
                        lastModified: '2026-01-01T00:00:00.000Z',
                        url: 'https://assets.pinefield.cn/apps/myapp/file1.png',
                      },
                      {
                        name: 'file2.jpg',
                        path: 'apps/myapp/file2.jpg',
                        type: 'file',
                        size: 200,
                        lastModified: '2026-01-02T00:00:00.000Z',
                        url: 'https://assets.pinefield.cn/apps/myapp/file2.jpg',
                      },
                    ],
                  },
                ],
              },
            ],
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await listResources('myapp')
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('file1.png')
      expect(result[0].url).toBe('https://assets.pinefield.cn/apps/myapp/file1.png')
      expect(result[1].name).toBe('file2.jpg')
    })

    it('应展平嵌套子目录中的文件', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tree: [
              {
                name: 'apps',
                path: 'apps/',
                type: 'directory',
                children: [
                  {
                    name: 'myapp',
                    path: 'apps/myapp/',
                    type: 'directory',
                    children: [
                      {
                        name: 'root.png',
                        path: 'apps/myapp/root.png',
                        type: 'file',
                        size: 100,
                        lastModified: '2026-01-01T00:00:00.000Z',
                        url: 'https://assets.pinefield.cn/apps/myapp/root.png',
                      },
                      {
                        name: 'images',
                        path: 'apps/myapp/images/',
                        type: 'directory',
                        children: [
                          {
                            name: 'nested.png',
                            path: 'apps/myapp/images/nested.png',
                            type: 'file',
                            size: 50,
                            lastModified: '2026-01-02T00:00:00.000Z',
                            url: 'https://assets.pinefield.cn/apps/myapp/images/nested.png',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await listResources('myapp')
      expect(result).toHaveLength(2)
      expect(result.map((f) => f.name)).toEqual(['root.png', 'nested.png'])
    })

    it('appId 不存在时应返回空数组', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tree: [
              {
                name: 'apps',
                path: 'apps/',
                type: 'directory',
                children: [],
              },
            ],
          }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await listResources('non-existent')
      expect(result).toEqual([])
    })

    it('API 请求失败时应抛出错误', async () => {
      process.env.PF_SESSION_TOKEN = 'test-token'

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      })
      vi.stubGlobal('fetch', mockFetch)

      await expect(listResources('myapp')).rejects.toThrow('获取资源列表失败')
    })

    it('请求应包含正确的 authorization header', async () => {
      process.env.PF_SESSION_TOKEN = 'my-special-token'

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tree: [] }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await listResources('myapp')

      const [url, opts] = mockFetch.mock.calls[0]
      expect(url).toContain('/list')
      expect(opts.headers.authorization).toBe('Bearer my-special-token')
    })

    it('token 未设置时应抛出错误', async () => {
      delete process.env.PF_SESSION_TOKEN

      await expect(listResources('myapp')).rejects.toThrow('PF_SESSION_TOKEN')
    })
  })
})
