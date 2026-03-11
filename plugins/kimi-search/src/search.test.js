import { describe, it, expect, vi, beforeEach } from 'vitest';
import { search } from './search.js';

vi.mock('./client.js', () => ({
  createClient: vi.fn(),
  SEARCH_TOOLS: [{ type: 'builtin_function', function: { name: '$web_search' } }],
  DEFAULT_MODEL: 'kimi-k2.5',
  SYSTEM_PROMPT: 'system prompt',
}));

const { createClient } = await import('./client.js');

function makeCompletionResponse(content, finishReason = 'stop', toolCalls = null) {
  const message = { role: 'assistant', content };
  if (toolCalls) {
    message.tool_calls = toolCalls;
    message.content = null;
  }
  return { choices: [{ message, finish_reason: finishReason }] };
}

function makeThinkingCompletionResponse(content, reasoningContent, finishReason = 'stop', toolCalls = null) {
  const message = { role: 'assistant', content, reasoning_content: reasoningContent };
  if (toolCalls) {
    message.tool_calls = toolCalls;
    message.content = null;
  }
  return { choices: [{ message, finish_reason: finishReason }] };
}

describe('search', () => {
  let mockCreate;

  beforeEach(() => {
    mockCreate = vi.fn();
    createClient.mockReturnValue({
      chat: { completions: { create: mockCreate } },
    });
  });

  it('should return direct response when no tool calls', async () => {
    mockCreate.mockResolvedValueOnce(
      makeCompletionResponse('搜索结果内容')
    );

    const result = await search('test query');
    expect(result).toBe('搜索结果内容');
  });

  it('should disable thinking via body.thinking field in instant mode', async () => {
    mockCreate.mockResolvedValueOnce(
      makeCompletionResponse('result')
    );

    await search('test query');

    const body = mockCreate.mock.calls[0][0];
    expect(body.thinking).toEqual({ type: 'disabled' });
    expect(body.temperature).toBe(0.6);
  });

  it('should not pass requestOptions in instant mode (single argument)', async () => {
    mockCreate.mockResolvedValueOnce(
      makeCompletionResponse('result')
    );

    await search('test query');

    expect(mockCreate.mock.calls[0]).toHaveLength(1);
  });

  it('should handle tool_calls loop correctly', async () => {
    const toolCall = {
      id: 'call_1',
      function: { name: '$web_search', arguments: '{"query":"test"}' },
    };

    mockCreate
      .mockResolvedValueOnce(
        makeCompletionResponse(null, 'tool_calls', [toolCall])
      )
      .mockResolvedValueOnce(
        makeCompletionResponse('最终搜索结果')
      );

    const result = await search('test query');
    expect(result).toBe('最终搜索结果');
    expect(mockCreate).toHaveBeenCalledTimes(2);

    const secondBody = mockCreate.mock.calls[1][0];
    const toolMessage = secondBody.messages.find((m) => m.role === 'tool');
    expect(toolMessage).toBeDefined();
    expect(toolMessage.tool_call_id).toBe('call_1');
  });

  it('should preserve reasoning_content in assistant tool_call messages when thinking is enabled', async () => {
    const toolCall = {
      id: 'call_1',
      function: { name: '$web_search', arguments: '{"query":"test"}' },
    };

    mockCreate
      .mockResolvedValueOnce(
        makeThinkingCompletionResponse(null, '我需要搜索一下', 'tool_calls', [toolCall])
      )
      .mockResolvedValueOnce(
        makeThinkingCompletionResponse('最终结果', '总结一下搜索结果')
      );

    const result = await search('test query', { thinking: true });
    expect(result).toBe('最终结果');

    const secondBody = mockCreate.mock.calls[1][0];
    const assistantMsg = secondBody.messages.find(
      (m) => m.role === 'assistant' && m.tool_calls
    );
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg.reasoning_content).toBe('我需要搜索一下');
  });

  it('should set reasoning_content to empty string when thinking is enabled but response has no reasoning_content', async () => {
    const toolCall = {
      id: 'call_1',
      function: { name: '$web_search', arguments: '{"query":"test"}' },
    };

    mockCreate
      .mockResolvedValueOnce(
        makeCompletionResponse(null, 'tool_calls', [toolCall])
      )
      .mockResolvedValueOnce(
        makeCompletionResponse('最终结果')
      );

    const result = await search('test query', { thinking: true });
    expect(result).toBe('最终结果');

    const secondBody = mockCreate.mock.calls[1][0];
    const assistantMsg = secondBody.messages.find(
      (m) => m.role === 'assistant' && m.tool_calls
    );
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg).toHaveProperty('reasoning_content');
    expect(assistantMsg.reasoning_content).toBe('');
  });

  it('should use temperature=1 and no thinking field when thinking mode is enabled', async () => {
    mockCreate.mockResolvedValueOnce(
      makeThinkingCompletionResponse('result', 'reasoning')
    );

    await search('test query', { thinking: true });

    const body = mockCreate.mock.calls[0][0];
    expect(body.temperature).toBe(1);
    expect(body).not.toHaveProperty('thinking');
  });

  it('should allow custom temperature in instant mode', async () => {
    mockCreate.mockResolvedValueOnce(
      makeCompletionResponse('result')
    );

    await search('test query', { temperature: 0.3 });

    const body = mockCreate.mock.calls[0][0];
    expect(body.temperature).toBe(0.3);
  });

  it('should use specified model', async () => {
    mockCreate.mockResolvedValueOnce(
      makeCompletionResponse('result')
    );

    await search('test query', { model: 'moonshot-v1-8k' });

    const body = mockCreate.mock.calls[0][0];
    expect(body.model).toBe('moonshot-v1-8k');
  });

  it('should return empty string when content is null', async () => {
    mockCreate.mockResolvedValueOnce(
      makeCompletionResponse(null, 'stop')
    );

    const result = await search('test query');
    expect(result).toBe('');
  });
});
