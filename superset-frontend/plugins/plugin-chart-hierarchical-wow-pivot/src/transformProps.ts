import {
  ChartProps,
  CurrencyFormatter,
  getMetricLabel,
  getNumberFormatter,
} from '@superset-ui/core';
import { buildTree } from './buildTree';
import {
  TransformedProps,
  MetricConfig,
  MetricFormatType,
  HierarchicalWowFormData,
} from './types';

export default function transformProps(
  chartProps: ChartProps,
): TransformedProps {
  const {
    width,
    height,
    queriesData,
    formData: rawFormData,
    datasource: { columnFormats = {}, currencyFormats = {} },
  } = chartProps;
  const formData = rawFormData as HierarchicalWowFormData;
  const data: Record<string, any>[] = queriesData?.[0]?.data ?? [];
  const hierarchyColumns: string[] = Array.isArray(formData.groupby)
    ? formData.groupby
    : [];
  const { valueFormat, currencyFormat } = formData;
  const colnames = chartProps.queriesData[0].colnames || [];
  const groups = formData.groupby || [];
  const fullMetrics = colnames.filter(el => !groups?.includes(el));
  // need to connect currency and value format
  // console.log('chartProps', chartProps);
  const metricKeys = formData.metrics.map(getMetricLabel);
  const showRootRow = formData.show_root_row ?? true;

  // const defaultFormatter = currencyFormat?.symbol
  //   ? new CurrencyFormatter({
  //       currency: currencyFormat,
  //       d3Format: valueFormat,
  //     })
  //   : getNumberFormatter(valueFormat);
  // console.log('defaultFormatterwwwwww', defaultFormatter(52345.678));
  const tree = buildTree(
    data,
    hierarchyColumns,
    fullMetrics,
    metricKeys,
    showRootRow,
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
  };
}
