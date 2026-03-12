/**
 * OSS 默认配置
 * 敏感凭证必须通过环境变量提供，不允许硬编码
 */

export const DEFAULT_OSS_ENDPOINT = 'https://oss-cn-zhangjiakou.aliyuncs.com'

export const DEFAULT_ALLOWED_BUCKETS = [
    'pf-test-public-web',
    'pf-test-public-file',
    'pf-test-protect-web',
    'pf-test-protect-file',
    'pf-test-private-web',
    'pf-test-private-file',
]
