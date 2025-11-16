export function getTimeGrainSqlaFormatter(datePart: string): string | null {
  const timeGrainMap: Record<string, string> = {
    PT1S: 'Sec',
    PT1M: 'Min',
    PT1H: 'HoH',
    P1D: 'DoD',
    P1W: 'WoW',
    P1M: 'MoM',
    P3M: 'QoQ',
    P1Y: 'YoY',
  };
  return timeGrainMap[datePart] || null;
}
