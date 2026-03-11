import { request } from './client.js';

export async function checkToken(token) {
  const data = await request('/token/check', { token });
  return data;
}
