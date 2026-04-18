import { getNumberFormatter } from '@superset-ui/core';

const DEFAULT_NUMBER_FORMAT = ',.0f';
const DEFAULT_PERCENT_FORMAT = '+.1%';

export function formatMetricValue(
  value: number | null,
  formatStr?: string,
): string {
  if (value == null) return String(null) //'—';
  const formatter = getNumberFormatter(formatStr || DEFAULT_NUMBER_FORMAT);
  return formatter(value);
}

export function formatDelta(
  value: number | null,
  formatStr?: string,
): string {
  if (value == null) return String(null) //'—';
  const formatter = getNumberFormatter(formatStr || DEFAULT_NUMBER_FORMAT);
  const formatted = formatter(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatWoW(
  value: number | null,
  formatStr?: string,
): string {
  if (value == null) return String(null) //'—';
  const formatter = getNumberFormatter(formatStr || DEFAULT_PERCENT_FORMAT);
  return formatter(value);
}

export function formatPrevText(timeGrain: string): string {
  if(timeGrain === 'P1D') return '7D ago';
  return 'Previous';
}

export function formatWoWText(timeGrain: string): string {
  switch(timeGrain) {
    case 'P1D': return '7D ago,%';
    case 'P1W': return 'WoW%';
    case 'P1M': return 'MoM%';
    case 'P3M': return 'QoQ%';
    case 'P1Y': return 'YoY%';
    default: return 'PoP%';
  }
}