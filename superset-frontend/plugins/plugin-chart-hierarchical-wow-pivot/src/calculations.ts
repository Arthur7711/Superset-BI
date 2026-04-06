export function calculateDelta(
  cur: number | null | undefined,
  prev: number | null | undefined,
): number | null {
  if (cur == null || prev == null) return null;
  return cur - prev;
}

export function calculateWoW(
  cur: number | null | undefined,
  prev: number | null | undefined,
): number | null {
  if (cur == null || prev == null) return null;
  if (prev === 0 && cur === 0) return 0;
  if (prev === 0) return null;
  return cur / prev - 1;
}
