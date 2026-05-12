import {
  QueryFormData,
  QueryFormMetric,
  ChartProps,
  JsonObject,
  Currency,
  ValueFormatter,
  HandlerFunction,
  DataRecordValue,
  QueryFormColumn,
  SetDataMaskHook,
} from '@superset-ui/core';
import type { MetricFormatEntry } from './components/MetricFormatsControl';

export type SelectedFiltersType = Record<string, DataRecordValue[]>;

export enum MetricFormatType {
  Number = 'number',
  Currency = 'currency',
  Percent = 'percent',
}

export interface MetricConfig {
  key: string;
  label: string;
  formatType: MetricFormatType;
  decimals: number;
  compact: boolean;
  currencyPrefix?: string;
}

export interface ConditionalFormatConfig {
  enabled: boolean;
  positiveThreshold: number;
  negativeThreshold: number;
}

export type SubColumn = 'cur' | 'delta' | 'prev' | 'wow';

export interface SortConfig {
  metricKey: string;
  subColumn: SubColumn;
  direction: 'asc' | 'desc';
}

export interface TreeNodeData {
  [key: string]: number | string | null;
}

export interface TreeNode {
  name: string;
  key: string;
  level: number;
  children: TreeNode[];
  data: TreeNodeData;
  rawValue?: DataRecordValue;
}

export interface FlatRow {
  node: TreeNode;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  isMatchHighlight?: boolean;
}

export interface HierarchicalWowFormData extends QueryFormData {
  x_axis?: string;
  hierarchy_columns: string[];
  /** Populated by hidden control; maps column name -> is temporal */
  temporal_columns_lookup?: Record<string, boolean>;
  node_key_columns?: string[];
  metrics: QueryFormMetric[];
  default_expanded_level: number;
  show_root_row: boolean;
  show_level_badges: boolean;
  time_shift: string;
  metric_formats?: Record<string, MetricFormatEntry>;
  conditional_formatting: boolean;
  positive_threshold: number;
  negative_threshold: number;
  enabled_metrics?: string[];
}

export interface HierarchicalWowChartProps extends ChartProps {
  formData: HierarchicalWowFormData;
}

export interface TransformedProps {
  width: number;
  height: number;
  tree: TreeNode;
  metrics: MetricConfig[];
  defaultExpandedLevel: number;
  showRootRow: boolean;
  showLevelBadges: boolean;
  conditionalFormatting: ConditionalFormatConfig;
  hierarchyColumns: string[];
  metricFormatters: Record<string, ValueFormatter>;
  defaultFormatter: ValueFormatter;
  columnFormats: JsonObject;
  currencyFormats: Record<string, Currency>;
  timeGrainSqla: string;
  revertDeltaMap: Record<string, boolean>;
  enabledMetrics?: string[];
  /** Explore hook: persist enabled metric keys when toggling in-chart */
  setControlValue?: HandlerFunction;
  /** Cross-filter wiring (matches plugin-chart-pivot-table) */
  setDataMask: SetDataMaskHook;
  selectedFilters?: SelectedFiltersType | null;
  emitCrossFilters?: boolean;
  verboseMap?: Record<string, string>;
  rawGroupby: QueryFormColumn[];
  rawXAxis?: QueryFormColumn;
}
