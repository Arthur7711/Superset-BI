import { calculateDelta, calculateWoW } from '../src/calculations';

describe('calculateDelta', () => {
  it('returns difference when both values present', () => {
    expect(calculateDelta(150, 100)).toBe(50);
  });

  it('returns negative delta', () => {
    expect(calculateDelta(80, 100)).toBe(-20);
  });

  it('returns 0 when equal', () => {
    expect(calculateDelta(100, 100)).toBe(0);
  });

  it('returns null when cur is null', () => {
    expect(calculateDelta(null, 100)).toBeNull();
  });

  it('returns null when prev is null', () => {
    expect(calculateDelta(100, null)).toBeNull();
  });

  it('returns null when both null', () => {
    expect(calculateDelta(null, null)).toBeNull();
  });

  it('returns null when cur is undefined', () => {
    expect(calculateDelta(undefined, 100)).toBeNull();
  });
});

describe('calculateWoW', () => {
  it('returns positive WoW%', () => {
    expect(calculateWoW(120, 100)).toBeCloseTo(0.2);
  });

  it('returns negative WoW%', () => {
    expect(calculateWoW(80, 100)).toBeCloseTo(-0.2);
  });

  it('returns 0 when both are 0', () => {
    expect(calculateWoW(0, 0)).toBe(0);
  });

  it('returns null when prev is 0 and cur > 0', () => {
    expect(calculateWoW(100, 0)).toBeNull();
  });

  it('returns null when cur is null', () => {
    expect(calculateWoW(null, 100)).toBeNull();
  });

  it('returns null when prev is null', () => {
    expect(calculateWoW(100, null)).toBeNull();
  });

  it('returns 0 when cur equals prev', () => {
    expect(calculateWoW(100, 100)).toBe(0);
  });

  it('handles 100% growth', () => {
    expect(calculateWoW(200, 100)).toBeCloseTo(1.0);
  });
});
