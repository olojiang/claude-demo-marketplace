const BASE_URL = 'http://ssh.olojiang.dpdns.org:8000';

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
    throw new Error(`request failed [${response.status}]: ${text || response.statusText}`);
  }

  return response.json();
}
