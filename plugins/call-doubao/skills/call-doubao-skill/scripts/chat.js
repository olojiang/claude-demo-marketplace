import { request, DEFAULT_CHAT_MODEL } from './client.js';
import { resolveImage } from './resolve-image.js';

function buildContent(text, image) {
  if (!image) return text;

  const imageUrl = resolveImage(image);
  return [
    { type: 'text', text },
    { type: 'image_url', image_url: { url: imageUrl } },
  ];
}

export async function chat(text, options = {}) {
  const { model = DEFAULT_CHAT_MODEL, image } = options;

  const body = {
    model,
    messages: [{ role: 'user', content: buildContent(text, image) }],
    stream: false,
  };

  const data = await request('/v1/chat/completions', body);
  return data.choices?.[0]?.message?.content ?? '';
}
