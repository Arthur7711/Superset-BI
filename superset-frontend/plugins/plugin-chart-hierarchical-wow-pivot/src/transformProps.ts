import {
  ChartProps,
  getMetricLabel,
  QueryFormColumn,
} from '@superset-ui/core';
import { buildTree } from './features/buildTree';
import {
  TransformedProps,
  MetricConfig,
  MetricFormatType,
} from './types';

export default function transformProps(
  chartProps: ChartProps,
): TransformedProps {
  const {
    width,
    height,
    queriesData,
    formData,
    rawFormData,
    datasource: { columnFormats = {}, currencyFormats = {} },
  } = chartProps;
  // const formData = rawFormData as HierarchicalWowFormData;
  // const formData = formData as HierarchicalWowFormData;
  const data: Record<string, any>[] = queriesData?.[0]?.data ?? [];
  const normalizeColumnName = (column: QueryFormColumn) =>
    typeof column === 'string' ? column : (column?.label ?? '');
  const groupbyColumns = Array.isArray(formData.groupby)
    ? formData.groupby
        .map(normalizeColumnName)
        .filter((columnName): columnName is string => Boolean(columnName))
    : [];
  const hierarchyColumns: string[] = formData.x_axis
    ? Array.from(new Set([...groupbyColumns, formData.x_axis]))
    : groupbyColumns;
  const { 
    valueFormat, 
    currencyFormat, 
    makeRevertDeltaDeviations, 
    makeRevertPopDeviations 
  } = formData;
  const colnames = chartProps.queriesData[0].colnames || [];
  const groups = hierarchyColumns;
  const fullMetrics = colnames.filter((el: string) => !groups?.includes(el));
  const metricKeys = formData.metrics.map(getMetricLabel);
  const showRootRow = formData.show_root_row ?? true;
  console.log('formData', formData);
  const tree = buildTree(
    data,
    hierarchyColumns,
    fullMetrics,
    metricKeys,
    showRootRow,
    formData.xAxis,
    formData.compareLag,
    rawFormData?.extra_form_data?.time_grain_sqla || formData.timeGrainSqla,
    // defaultFormatter,
  );
  const metrics: MetricConfig[] = metricKeys.map(key => ({
    key,
    label: key,
    formatType: MetricFormatType.Number,
    decimals: 0,
    compact: false,
  }));

  return {
    width,
    height,
    tree,
    metrics,
    defaultExpandedLevel: formData.default_expanded_level ?? 1,
    showRootRow,
    showLevelBadges: formData.show_level_badges ?? true,
    conditionalFormatting: {
      enabled: formData.conditional_formatting ?? true,
      positiveThreshold: Number(formData.positive_threshold) || 0,
      negativeThreshold: Number(formData.negative_threshold) || 0,
    },
    hierarchyColumns,
    valueFormat,
    currencyFormat,
    columnFormats,
    currencyFormats,
    timeGrainSqla: rawFormData?.extra_form_data?.time_grain_sqla || formData.timeGrainSqla,
    makeRevertDeltaDeviations,
    makeRevertPopDeviations,
  };
}
