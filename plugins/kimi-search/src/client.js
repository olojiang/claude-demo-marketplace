import OpenAI from 'openai';

const KIMI_BASE_URL = 'https://api.moonshot.cn/v1';

export function createClient() {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new Error('KIMI_API_KEY environment variable is required');
  }

  return new OpenAI({
    apiKey,
    baseURL: KIMI_BASE_URL,
  });
}

export const SEARCH_TOOLS = [
  {
    type: 'builtin_function',
    function: { name: '$web_search' },
  },
];

export const DEFAULT_MODEL = 'kimi-k2.5';

export const SYSTEM_PROMPT =
  '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。';
