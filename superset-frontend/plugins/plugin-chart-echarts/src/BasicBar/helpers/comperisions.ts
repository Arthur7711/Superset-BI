export interface ComparisonLag {
  periods: number;
  label: string;
}

export interface ComparisonResult {
  label: string;
  value: number | null;
  isPositive: boolean;
  periods: number;
}

export function parseComparisonLags(lagsString: string): ComparisonLag[] {
  if (!lagsString) return [{ periods: 1, label: 'prev' }];

  return lagsString.split(',').map(item => {
    const [periodsStr, label] = item.trim().split(':');
    const periods = parseInt(periodsStr, 10) || 1;
    return {
      periods,
      label: label?.trim() || `${periods}p ago`,
    };
  });
}

export function calculateComparisons(
  data: any[],
  comparisonType: string,
  comparisonLags: ComparisonLag[],
  avgValue: number | null,
  goalValue: number | null,
  suffix: string,
): ComparisonResult[] {
  if (comparisonType === 'none' || data.length < 2) {
    return [];
  }

  const currentValue = data[data.length - 1][1];
  if (typeof currentValue !== 'number') {
    return [];
  }

  const results: ComparisonResult[] = [];

  if (comparisonType === 'custom') {
    // Multiple period lags
    for (const lag of comparisonLags) {
      const compareIndex = data.length - 1 - lag.periods;
      if (compareIndex >= 0) {
        const compareValue = data[compareIndex]?.[1];
        if (typeof compareValue === 'number' && compareValue !== 0) {
          const diff =
            ((currentValue - compareValue) / Math.abs(compareValue)) * 100;
          results.push({
            label: lag.label,
            value: diff,
            isPositive: diff >= 0,
            periods: lag.periods,
          });
        }
      }
    }
  } else if (comparisonType === 'avg') {
    if (avgValue !== null && avgValue !== 0) {
      const diff = ((currentValue - avgValue) / Math.abs(avgValue)) * 100;
      results.push({
        label: 'vs AVG',
        value: diff,
        isPositive: diff >= 0,
        periods: 0,
      });
    }
  } else if (comparisonType === 'goal') {
    if (goalValue !== null && goalValue !== 0) {
      const diff = ((currentValue - goalValue) / Math.abs(goalValue)) * 100;
      results.push({
        label: 'vs Goal',
        value: diff,
        isPositive: diff >= 0,
        periods: 0,
      });
    }
  }

  return results;
}
