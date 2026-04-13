import { createClient, SEARCH_TOOLS, DEFAULT_MODEL, SYSTEM_PROMPT } from './client.js';

function handleToolCall(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  if (toolCall.function.name === '$web_search') {
    return args;
  }
  return { error: `unknown tool: ${toolCall.function.name}` };
}

/**
 * @param {string} query - 搜索问题
 * @param {object} [options]
 * @param {string} [options.model] - 模型名称，默认 kimi-k2.5
 * @param {number} [options.temperature] - 温度，仅 instant 模式有效，默认 0.6
 * @param {boolean} [options.thinking] - 启用 thinking 模式（temperature 强制为 1），默认 false
 * @returns {Promise<string>} 搜索结果文本
 */
export async function search(query, options = {}) {
  const client = createClient();
  const model = options.model || DEFAULT_MODEL;
  const thinking = options.thinking ?? false;

  const body = {
    model,
    messages: null,
    temperature: thinking ? 1 : (options.temperature ?? 0.6),
    tools: SEARCH_TOOLS,
  };

  if (!thinking) {
    body.thinking = { type: 'disabled' };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: query },
  ];

  const MAX_TOOL_ITERATIONS = 10;
  let finishReason = null;
  let iteration = 0;

  while (finishReason === null || finishReason === 'tool_calls') {
    if (++iteration > MAX_TOOL_ITERATIONS) {
      console.error(`search: exceeded max tool call iterations (${MAX_TOOL_ITERATIONS}), aborting`);
      break;
    }
    body.messages = messages;
    const completion = await client.chat.completions.create(body);

    const choice = completion.choices[0];
    finishReason = choice.finish_reason;

    if (finishReason === 'tool_calls') {
      const assistantMsg = {
        role: 'assistant',
        content: choice.message.content,
        tool_calls: choice.message.tool_calls,
      };
      if (thinking) {
        assistantMsg.reasoning_content = choice.message.reasoning_content || '';
      }
      messages.push(assistantMsg);

      for (const toolCall of choice.message.tool_calls) {
        const result = handleToolCall(toolCall);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(result),
        });
      }
      continue;
    }

    return choice.message.content || '';
  }

  return '';
}
