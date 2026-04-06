import { formatMetricValue, formatDelta, formatWoW } from '../src/formatting';

describe('formatMetricValue', () => {
  it('formats a number with default format', () => {
    const result = formatMetricValue(1234567);
    expect(result).toContain('1,234,567');
  });

  it('returns dash for null', () => {
    expect(formatMetricValue(null)).toBe('—');
  });

  it('formats 0', () => {
    expect(formatMetricValue(0)).toBe('0');
  });
});

describe('formatDelta', () => {
  it('adds + prefix for positive values', () => {
    const result = formatDelta(500);
    expect(result).toMatch(/^\+/);
  });

  it('adds - prefix for negative values', () => {
    const result = formatDelta(-500);
    expect(result).toMatch(/^-/);
  });

  it('returns dash for null', () => {
    expect(formatDelta(null)).toBe('—');
  });

  it('formats zero without sign', () => {
    const result = formatDelta(0);
    expect(result).toBe('0');
  });
});

describe('formatWoW', () => {
  it('formats positive WoW%', () => {
    const result = formatWoW(0.25);
    expect(result).toContain('25');
    expect(result).toContain('%');
  });

  it('formats negative WoW%', () => {
    const result = formatWoW(-0.1);
    expect(result).toContain('10');
    expect(result).toContain('%');
  });

  it('returns dash for null', () => {
    expect(formatWoW(null)).toBe('—');
  });

  it('formats zero', () => {
    const result = formatWoW(0);
    expect(result).toContain('0');
  });
});
