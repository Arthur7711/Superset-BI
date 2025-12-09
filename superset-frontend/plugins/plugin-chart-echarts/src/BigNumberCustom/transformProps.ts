/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.
 */
import {
  getMetricLabel,
  getNumberFormatter,
  ensureIsArray,
  getXAxisColumn,
  isXAxisSet,
} from '@superset-ui/core';
import {
  BigNumberCustomChartProps,
  BigNumberCustomTransformedProps,
  ColorLegend,
  TrendDataPoint,
  ComparisonType,
  TrendChartType,
  ComparisonResult,
  ComparisonLag,
  MetricCardData,
  AggregationType,
} from './types';

function parseComparisonLags(lagsString: string): ComparisonLag[] {
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

function parseColorThresholds(thresholdsString: string): number[] {
  if (!thresholdsString) return [50, 80];
  return thresholdsString
    .split(',')
    .map(s => parseFloat(s.trim()))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
}

function getValueColor(
  value: number | null,
  useColorLegend: boolean,
  colorLegend: ColorLegend,
  positiveColor: string,
  warningColor: string,
  negativeColor: string,
): string {
  if (!useColorLegend || value === null) return '#262626';

  const thresholds = colorLegend.thresholds;
  if (thresholds.length < 2) return '#262626';

  // Simple threshold logic: value < t1 = red, t1 <= value < t2 = yellow, value >= t2 = green
  const [t1, t2] = thresholds;

  if (value < t1) return negativeColor;
  if (value < t2) return warningColor;
  return positiveColor;
}

function getWarningDotColor(
  value: number | null,
  useColorLegend: boolean,
  colorLegend: ColorLegend,
  showWarningDot: boolean,
  warningColor: string,
  negativeColor: string,
): string | null {
  if (!showWarningDot || !useColorLegend || value === null) return null;

  const thresholds = colorLegend.thresholds;
  if (thresholds.length < 2) return null;

  const [t1, t2] = thresholds;

  if (value < t1) return negativeColor;
  if (value < t2) return warningColor;

  return null;
}

function parseTimestamp(value: any): number {
  if (value === null || value === undefined) return 0;

  // Already a number (milliseconds)
  if (typeof value === 'number') {
    // Check if it's seconds (Unix timestamp) vs milliseconds
    // If it's less than 1e12, it's likely seconds
    if (value > 0 && value < 1e12) {
      return value * 1000;
    }
    return value;
  }

  // String timestamp
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) return parsed;

    // Try parsing as number string
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num > 0 && num < 1e12) return num * 1000;
      return num;
    }
  }

  // Date object
  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
}

function formatDateRange(
  data: any[],
  xAxisColumn: string | null = null,
): string {
  if (!data.length) return '';

  const timestamps = data
    .map(d => {
      const rawTs =
        xAxisColumn && d[xAxisColumn] !== undefined
          ? d[xAxisColumn]
          : d.__timestamp;
      return parseTimestamp(rawTs);
    })
    .filter(t => t > 0)
    .sort((a, b) => a - b);

  if (timestamps.length === 0) return '';

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    if (isNaN(date.getTime()) || date.getFullYear() < 1980) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month}'${year}`;
  };

  const startStr = formatDate(timestamps[0]);
  const endStr = formatDate(timestamps[timestamps.length - 1]);

  if (!startStr && !endStr) return '';
  if (timestamps.length === 1 || startStr === endStr) return startStr;

  return `${startStr} – ${endStr}`;
}

function calculateComparisons(
  data: any[],
  metricLabel: string,
  comparisonType: ComparisonType,
  comparisonLags: ComparisonLag[],
  avgValue: number | null,
  goalValue: number | null,
  suffix: string,
): ComparisonResult[] {
  if (comparisonType === 'none' || data.length < 2) {
    return [];
  }

  const currentValue = data[data.length - 1]?.[metricLabel];
  if (typeof currentValue !== 'number') {
    return [];
  }

  const results: ComparisonResult[] = [];

  if (comparisonType === 'custom') {
    // Multiple period lags
    for (const lag of comparisonLags) {
      const compareIndex = data.length - 1 - lag.periods;
      if (compareIndex >= 0) {
        const compareValue = data[compareIndex]?.[metricLabel];
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

function aggregateValue(
  values: number[],
  aggregation: AggregationType,
): number | null {
  if (values.length === 0) return null;

  switch (aggregation) {
    case 'LAST_VALUE':
      return values[values.length - 1];
    case 'SUM':
      return values.reduce((a, b) => a + b, 0);
    case 'MEAN':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'MIN':
      return Math.min(...values);
    case 'MAX':
      return Math.max(...values);
    case 'MEDIAN':
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    default:
      return values[values.length - 1];
  }
}

function processMetricData(
  data: any[],
  metricLabel: string,
  formData: any,
  colorLegend: ColorLegend,
  goalValue: number | null,
  comparisonLags: ComparisonLag[],
  xAxisColumn: string | null,
): MetricCardData {
  const {
    useColorLegend = false,
    showWarningDot = true,
    comparisonType = 'none' as ComparisonType,
    compareSuffix = '%',
    positiveColor = '#3cc8be',
    negativeColor = '#e57373',
    warningColor = '#ffb74d',
    aggregation = 'LAST_VALUE' as AggregationType,
    numberFormat = '',
  } = formData;

  // Extract numeric values for this metric
  const numericValues = data
    .map(d => d[metricLabel])
    .filter((v): v is number => typeof v === 'number');

  const bigNumber = aggregateValue(numericValues, aggregation);
  const totalValue = numericValues.reduce((a, b) => a + b, 0);
  const minValue = numericValues.length > 0 ? Math.min(...numericValues) : null;
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : null;
  const avgValue =
    numericValues.length > 0
      ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
      : null;

  // Build trend data with min/max flags
  const trendData: TrendDataPoint[] = data.map((record, index) => {
    const rawVal = record[metricLabel];
    const numericVal = typeof rawVal === 'number' ? rawVal : 0;

    // Get the raw timestamp - could be string (ISO date), number (ms), or undefined
    // Try the x-axis column first, then fall back to __timestamp
    const rawTimestamp =
      xAxisColumn && record[xAxisColumn] !== undefined
        ? record[xAxisColumn]
        : record.__timestamp;
    let timestamp: number | string;

    if (rawTimestamp !== null && rawTimestamp !== undefined) {
      // If it's a string, keep it as string for parsing in the viz component
      if (typeof rawTimestamp === 'string') {
        timestamp = rawTimestamp;
      } else if (typeof rawTimestamp === 'number') {
        // Convert to milliseconds if needed
        timestamp =
          rawTimestamp > 0 && rawTimestamp < 1e12
            ? rawTimestamp * 1000
            : rawTimestamp;
      } else {
        timestamp = index;
      }
    } else {
      timestamp = index;
    }

    return {
      timestamp,
      value: numericVal,
      isAboveGoal: goalValue !== null ? numericVal >= goalValue : undefined,
      isCurrent: index === data.length - 1,
      isMin: numericVal === minValue,
      isMax: numericVal === maxValue,
    };
  });

  // Calculate comparisons
  const comparisons = calculateComparisons(
    data,
    metricLabel,
    comparisonType,
    comparisonLags,
    avgValue,
    goalValue,
    compareSuffix,
  );

  // Get colors
  const valueColor = getValueColor(
    bigNumber,
    useColorLegend,
    colorLegend,
    positiveColor,
    warningColor,
    negativeColor,
  );

  const warningDotColor = getWarningDotColor(
    bigNumber,
    useColorLegend,
    colorLegend,
    showWarningDot,
    warningColor,
    negativeColor,
  );

  // Format number
  let formattedNumber = 'No Data';
  if (bigNumber !== null) {
    if (numberFormat) {
      try {
        const formatter = getNumberFormatter(numberFormat);
        formattedNumber = formatter(bigNumber);
      } catch {
        formattedNumber = bigNumber.toLocaleString();
      }
    } else {
      // Auto-format based on magnitude
      if (Math.abs(bigNumber) < 1 && Math.abs(bigNumber) > 0) {
        formattedNumber = `${(bigNumber * 100).toFixed(1)}%`;
      } else if (Math.abs(bigNumber) >= 1000000) {
        formattedNumber = `$${(bigNumber / 1000000).toFixed(1)}M`;
      } else if (Math.abs(bigNumber) >= 1000) {
        formattedNumber = `$${Math.round(bigNumber).toLocaleString()}`;
      } else {
        formattedNumber = bigNumber.toLocaleString();
      }
    }
  }

  // Goal progress
  const goalProgress =
    goalValue !== null && goalValue !== 0 ? (totalValue / goalValue) * 100 : 0;

  return {
    metricName: metricLabel,
    bigNumber,
    formattedNumber,
    valueColor,
    warningDotColor,
    trendData,
    comparisons,
    minValue,
    maxValue,
    avgValue,
    goalProgress,
    totalValue,
    numberFormat: numberFormat || '',
  };
}

export default function transformProps(
  chartProps: BigNumberCustomChartProps,
): BigNumberCustomTransformedProps {
  const { width, height, formData, queriesData } = chartProps;
  const {
    metrics: metricsRaw,
    metric,
    subheader = '',
    showDateRange = true,
    showTimestamp = false,

    // Color legend - simplified
    useColorLegend = false,
    colorThresholds = '50,80',
    useColorGradient = false,
    showWarningDot = true,

    // Comparison
    comparisonType = 'none' as ComparisonType,
    comparisonLags: comparisonLagsRaw = '1:MoM',

    // Goal
    showGoal = false,
    goalValue: goalValueRaw = '',
    showGoalProgress = false,
    showGoalPercent = false,

    // Trend
    showTrend = true,
    trendChartType = 'bar' as TrendChartType,
    showXAxis = true,
    showYAxis = false,
    colorOnlyLast = false,
    showMinMax = false,
    showAverageLine = false,

    // Colors
    primaryColor = '#8c8c8c',
    positiveColor = '#3cc8be',
    negativeColor = '#e57373',
    warningColor = '#ffb74d',

    // Fonts
    headerFontSize = 36,

    // Number formatting
    numberFormat = '',

    // Panel
    panelColumns = 3,
  } = formData;

  const data = queriesData?.[0]?.data || [];

  // Get the x-axis column name using Superset's helper function
  let xAxisColumn: string | null = null;
  if (isXAxisSet(formData)) {
    const xAxisColumns = ensureIsArray(getXAxisColumn(formData));
    if (xAxisColumns.length > 0) {
      xAxisColumn = String(xAxisColumns[0]);
    }
  }

  // Auto-detect timestamp column from data if x_axis not resolved
  if (!xAxisColumn && data.length > 0) {
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    // Look for common timestamp column names or check values
    for (const key of keys) {
      if (key === '__timestamp') {
        xAxisColumn = key;
        break;
      }
      // Check for date-like column names
      if (
        key.includes('date') ||
        key.includes('time') ||
        key.includes('timestamp')
      ) {
        xAxisColumn = key;
        break;
      }
      // Check if value looks like a date
      const val = firstRow[key];
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        xAxisColumn = key;
        break;
      }
    }
  }

  // Get metrics array
  const metricsArray = metricsRaw
    ? ensureIsArray(metricsRaw)
    : metric
      ? [metric]
      : [];
  const metricLabels = metricsArray.map(m => getMetricLabel(m));

  // Parse color thresholds - simplified format
  const thresholds = parseColorThresholds(String(colorThresholds));
  const colorLegend: ColorLegend = {
    thresholds,
    useGradient: Boolean(useColorGradient),
  };

  const goalValue = goalValueRaw ? parseFloat(String(goalValueRaw)) : null;
  const comparisonLags = parseComparisonLags(comparisonLagsRaw);

  // Determine if panel mode (multiple metrics)
  const isPanelMode = metricLabels.length > 1;

  // Process each metric
  const metricCards: MetricCardData[] = metricLabels.map(label =>
    processMetricData(
      data,
      label,
      formData,
      colorLegend,
      goalValue,
      comparisonLags,
      xAxisColumn,
    ),
  );

  // Get primary metric data for backwards compatibility
  const primaryCard = metricCards[0] || {
    metricName: '',
    bigNumber: null,
    formattedNumber: 'No Data',
    valueColor: '#262626',
    warningDotColor: null,
    trendData: [],
    comparisons: [],
    minValue: null,
    maxValue: null,
    avgValue: null,
    goalProgress: 0,
    totalValue: 0,
    numberFormat: '',
  };

  // Get date range and timestamp
  const dateRange = formatDateRange(data, xAxisColumn);
  const lastRecord = data.length > 0 ? data[data.length - 1] : null;
  const rawTs = lastRecord
    ? xAxisColumn && lastRecord[xAxisColumn] !== undefined
      ? lastRecord[xAxisColumn]
      : lastRecord.__timestamp
    : null;
  const timestamp: number | string | null = parseTimestamp(rawTs) || null;

  return {
    width,
    height,

    // Panel mode
    isPanelMode,
    panelColumns: parseInt(String(panelColumns), 10) || 3,
    metricCards,

    // Legacy single metric
    bigNumber: primaryCard.bigNumber,
    formattedNumber: primaryCard.formattedNumber,
    metricName: primaryCard.metricName,

    // Date/time
    dateRange,
    showDateRange,
    timestamp,
    showTimestamp,

    // Color legend
    useColorLegend,
    valueColor: primaryCard.valueColor,
    colorLegend,

    // Warning
    showWarningDot,
    warningDotColor: primaryCard.warningDotColor,

    // Comparisons
    comparisons: primaryCard.comparisons,
    comparisonType,

    // Subheader
    subheader,

    // Trend
    showTrend,
    trendChartType,
    trendData: primaryCard.trendData,
    showXAxis,
    showYAxis,
    colorOnlyLast,

    // Goal
    showGoal,
    goalValue,
    goalProgress: primaryCard.goalProgress,
    showGoalProgress,
    showGoalPercent,
    totalValue: primaryCard.totalValue,

    // Statistics
    showMinMax,
    minValue: primaryCard.minValue,
    maxValue: primaryCard.maxValue,
    avgValue: primaryCard.avgValue,
    showAverageLine,

    // Colors
    primaryColor,
    positiveColor,
    negativeColor,
    warningColor,

    // Fonts
    headerFontSize,
    subheaderFontSize: 14,

    // Number format
    numberFormat: numberFormat || '',
  };
}
