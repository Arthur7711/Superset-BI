function getWeekNumber(date: Date): number {
  const tempDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = tempDate.getUTCDay() || 7; // Sunday = 0, so set to 7
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
}

export function getWeekFromRange(rangeStr: string): number {
  const [startStr, endStr] = rangeStr.split('—').map(s => s.trim());

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  return getWeekNumber(endDate) || getWeekNumber(startDate);
}
