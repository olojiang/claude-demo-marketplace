import { describe, it, expect } from 'vitest';
import { parseArgs } from './cli.js';

describe('parseArgs', () => {
  it('should parse command and query', () => {
    const args = parseArgs(['search', 'hello', 'world']);
    expect(args._).toEqual(['search', 'hello', 'world']);
  });

  it('should parse --model option', () => {
    const args = parseArgs(['search', 'query', '--model', 'gemini-2.5-pro-preview']);
    expect(args.model).toBe('gemini-2.5-pro-preview');
    expect(args._).toEqual(['search', 'query']);
  });

  it('should handle query without options', () => {
    const args = parseArgs(['search', 'who', 'won', 'euro', '2024']);
    expect(args._).toEqual(['search', 'who', 'won', 'euro', '2024']);
    expect(args.model).toBeUndefined();
  });

  it('should parse multiple options together', () => {
    const args = parseArgs(['search', 'query', '--model', 'gemini-2.5-pro-preview']);
    expect(args.model).toBe('gemini-2.5-pro-preview');
    expect(args._).toEqual(['search', 'query']);
  });
});
