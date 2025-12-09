/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.
 */
import {
  ChartProps,
  QueryFormData,
  TimeseriesDataRecord,
  TimeGranularity,
} from '@superset-ui/core';

// Color threshold configuration - simplified
export interface ColorThreshold {
  value: number;
  color: string;
}

export interface ColorLegend {
  thresholds: number[]; // e.g., [0, 50, 80, 100] for red < 50 < yellow < 80 < green
  useGradient: boolean;
}

// Trend chart types
export type TrendChartType = 'line' | 'bar';

// Comparison types
export type ComparisonType = 'none' | 'custom' | 'avg' | 'goal';

// Comparison lag definition
export interface ComparisonLag {
  periods: number;
  label: string;
}

// Aggregation types
export type AggregationType = 'LAST_VALUE' | 'SUM' | 'MEAN' | 'MIN' | 'MAX' | 'MEDIAN';

export interface BigNumberCustomFormData extends QueryFormData {
  // Metrics - can be multiple for panel mode
  metric?: string;
  metrics?: string[];
  
  // Temporal axis
  x_axis?: string;
  time_grain_sqla?: TimeGranularity;
  aggregation?: AggregationType;
  
  subheader?: string;
  
  // Color legend - simplified
  useColorLegend?: boolean;
  colorThresholds?: string; // Comma-separated: "0,50,80,100"
  useColorGradient?: boolean;
  
  // Trend display
  showTrend?: boolean;
  trendChartType?: TrendChartType;
  showXAxis?: boolean;
  showYAxis?: boolean;
  colorOnlyLast?: boolean;
  
  // Goal/Target
  showGoal?: boolean;
  goalValue?: number;
  goalMetric?: string;
  goalAggregation?: AggregationType;
  showGoalProgress?: boolean;
  showGoalPercent?: boolean;
  
  // Comparison - now supports multiple lags
  comparisonType?: ComparisonType;
  comparisonLags?: string; // JSON string of ComparisonLag[]
  compareSuffix?: string;
  
  // Visual options
  showWarningDot?: boolean;
  showDateRange?: boolean;
  showMinMax?: boolean;
  showAverageLine?: boolean;
  showTimestamp?: boolean;
  startYAxisAtZero?: boolean;
  
  // Colors
  primaryColor?: string;
  positiveColor?: string;
  negativeColor?: string;
  warningColor?: string;
  
  // Fonts
  headerFontSize?: number;
  subheaderFontSize?: number;
  
  // Number formatting
  numberFormat?: string;
  comparisonSuffix?: string;
  
  // Panel mode
  panelColumns?: number;
}

export interface BigNumberCustomChartProps extends ChartProps {
  formData: BigNumberCustomFormData;
  queriesData: {
    data: TimeseriesDataRecord[];
  }[];
}

export type TrendDataPoint = {
  timestamp: number | string;
  value: number;
  isAboveGoal?: boolean;
  isCurrent?: boolean;
  isMin?: boolean;
  isMax?: boolean;
};

// Single metric card data
export interface MetricCardData {
  metricName: string;
  bigNumber: number | null;
  formattedNumber: string;
  valueColor: string;
  warningDotColor: string | null;
  trendData: TrendDataPoint[];
  comparisons: ComparisonResult[];
  minValue: number | null;
  maxValue: number | null;
  avgValue: number | null;
  goalProgress: number;
  totalValue: number;
  numberFormat: string;
}

// Comparison result
export interface ComparisonResult {
  label: string;
  value: number | null;
  isPositive: boolean;
  periods: number;
}

export type BigNumberCustomTransformedProps = {
  width: number;
  height: number;
  
  // Panel mode - multiple metrics
  isPanelMode: boolean;
  panelColumns: number;
  metricCards: MetricCardData[];
  
  // Legacy single metric (for backwards compatibility)
  bigNumber: number | null;
  formattedNumber: string;
  metricName: string;
  
  // Date range
  dateRange: string;
  showDateRange: boolean;
  
  // Color legend - simplified
  useColorLegend: boolean;
  valueColor: string;
  colorLegend: ColorLegend;
  
  // Warning indicator
  showWarningDot: boolean;
  warningDotColor: string | null;
  
  // Multiple comparisons
  comparisons: ComparisonResult[];
  comparisonType: ComparisonType;
  
  // Subheader
  subheader: string;
  
  // Trend chart
  showTrend: boolean;
  trendChartType: TrendChartType;
  trendData: TrendDataPoint[];
  showXAxis: boolean;
  showYAxis: boolean;
  colorOnlyLast: boolean;
  
  // Goal
  showGoal: boolean;
  goalValue: number | null;
  goalProgress: number;
  showGoalProgress: boolean;
  showGoalPercent: boolean;
  totalValue: number;
  
  // Statistics
  showMinMax: boolean;
  minValue: number | null;
  maxValue: number | null;
  avgValue: number | null;
  showAverageLine: boolean;
  
  // Colors
  primaryColor: string;
  positiveColor: string;
  negativeColor: string;
  warningColor: string;
  
  // Fonts
  headerFontSize: number;
  subheaderFontSize: number;
  
  // Number formatting
  numberFormat: string;
  
  // Timestamp
  timestamp: number | string | null;
  showTimestamp: boolean;
};
