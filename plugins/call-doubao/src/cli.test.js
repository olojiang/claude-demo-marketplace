import { describe, it, expect } from 'vitest';
import { parseArgs } from './cli.js';

describe('parseArgs', () => {
  it('should parse command only', () => {
    const args = parseArgs(['chat']);
    expect(args._).toEqual(['chat']);
  });

  it('should parse chat with text', () => {
    const args = parseArgs(['chat', '你好世界']);
    expect(args._).toEqual(['chat', '你好世界']);
  });

  it('should parse --model option', () => {
    const args = parseArgs(['chat', 'hello', '--model', 'gpt-4']);
    expect(args.model).toBe('gpt-4');
    expect(args._).toEqual(['chat', 'hello']);
  });

  it('should parse --image option', () => {
    const args = parseArgs(['chat', 'desc', '--image', 'https://img.com/a.jpg']);
    expect(args.image).toBe('https://img.com/a.jpg');
    expect(args._).toEqual(['chat', 'desc']);
  });

  it('should parse --ratio option', () => {
    const args = parseArgs(['image', 'cat', '--ratio', '16:9']);
    expect(args.ratio).toBe('16:9');
  });

  it('should parse --style option', () => {
    const args = parseArgs(['image', 'cat', '--style', '卡通']);
    expect(args.style).toBe('卡通');
  });

  it('should parse multiple options together', () => {
    const args = parseArgs([
      'image', '机器猫',
      '--model', 'Seedream 4.0',
      '--ratio', '4:3',
      '--style', '写实',
      '--image', 'https://example.com/src.jpg',
    ]);
    expect(args._).toEqual(['image', '机器猫']);
    expect(args.model).toBe('Seedream 4.0');
    expect(args.ratio).toBe('4:3');
    expect(args.style).toBe('写实');
    expect(args.image).toBe('https://example.com/src.jpg');
  });

  it('should parse token-check command', () => {
    const args = parseArgs(['token-check', 'abc123']);
    expect(args._).toEqual(['token-check', 'abc123']);
  });

  it('should parse help command', () => {
    const args = parseArgs(['help']);
    expect(args._).toEqual(['help']);
  });

  it('should handle empty args', () => {
    const args = parseArgs([]);
    expect(args._).toEqual([]);
  });
});
