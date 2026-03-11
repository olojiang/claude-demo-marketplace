import { request, DEFAULT_IMAGE_MODEL } from './client.js';
import { resolveImage } from './resolve-image.js';

export async function generateImage(prompt, options = {}) {
  const {
    model = DEFAULT_IMAGE_MODEL,
    ratio = '1:1',
    style = '写实',
    image,
  } = options;

  const body = { model, prompt, ratio, style, stream: false };

  if (image) {
    body.image = resolveImage(image);
  }

  const data = await request('/v1/images/generations', body);
  return data;
}
