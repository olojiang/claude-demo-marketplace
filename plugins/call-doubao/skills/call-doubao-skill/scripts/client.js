const BASE_URL = 'http://ssh.olojiang.dpdns.org:8000';

/** 当 DOUBAO_API_KEY（sessionId）过期时，提示用户如何更新 */
export const SESSION_EXPIRED_HINT = [
  'Doubao sessionId（即 DOUBAO_API_KEY）已过期或无效。',
  '更新方法：',
  '  1. 在 ~/.zshrc 中设置新的 token：export DOUBAO_API_KEY="<新 token>"',
  '  2. 执行 source ~/.zshrc 或重新打开终端',
].join('\n');

export const DEFAULT_CHAT_MODEL = 'doubao';
export const DEFAULT_IMAGE_MODEL = 'Seedream 4.0';

export function getApiKey() {
  const apiKey = process.env.DOUBAO_API_KEY;
  if (!apiKey) {
    throw new Error('DOUBAO_API_KEY environment variable is required');
  }
  return apiKey;
}

export async function request(path, body) {
  const apiKey = getApiKey();
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const msg = text || response.statusText;
    const isTokenError =
      response.status === 401 ||
      /authorization|token|invalid|expired|unauthorized/i.test(msg);
    if (isTokenError) {
      const e = new Error(`request failed [${response.status}]: ${msg}`);
      e.code = 'DOUBAO_SESSION_EXPIRED';
      throw e;
    }
    throw new Error(`request failed [${response.status}]: ${msg}`);
  }

  return response.json();
}
