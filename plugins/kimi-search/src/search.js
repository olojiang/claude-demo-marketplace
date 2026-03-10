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
 * @param {number} [options.temperature] - 温度，默认 0.6
 * @returns {Promise<string>} 搜索结果文本
 */
export async function search(query, options = {}) {
  const client = createClient();
  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature ?? 0.6;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: query },
  ];

  let finishReason = null;

  while (finishReason === null || finishReason === 'tool_calls') {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      tools: SEARCH_TOOLS,
    });

    const choice = completion.choices[0];
    finishReason = choice.finish_reason;

    if (finishReason === 'tool_calls') {
      messages.push(choice.message);

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
