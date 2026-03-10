import { describe, it, expect } from 'vitest';
import { parseArgs } from './cli.js';

describe('parseArgs', () => {
  it('should parse command and query', () => {
    const args = parseArgs(['search', 'hello', 'world']);
    expect(args._).toEqual(['search', 'hello', 'world']);
  });

  it('should parse --model option', () => {
    const args = parseArgs(['search', 'query', '--model', 'moonshot-v1-8k']);
    expect(args.model).toBe('moonshot-v1-8k');
    expect(args._).toEqual(['search', 'query']);
  });

  it('should parse --temperature option', () => {
    const args = parseArgs(['search', 'query', '--temperature', '0.3']);
    expect(args.temperature).toBe(0.3);
  });

  it('should parse --thinking flag', () => {
    const args = parseArgs(['search', 'query', '--thinking']);
    expect(args.thinking).toBe(true);
    expect(args._).toEqual(['search', 'query']);
  });

  it('should default thinking to undefined when not specified', () => {
    const args = parseArgs(['search', 'query']);
    expect(args.thinking).toBeUndefined();
  });

  it('should parse multiple options together', () => {
    const args = parseArgs(['search', 'query', '--model', 'kimi-k2.5', '--temperature', '0.5', '--thinking']);
    expect(args.model).toBe('kimi-k2.5');
    expect(args.temperature).toBe(0.5);
    expect(args.thinking).toBe(true);
  });
});
