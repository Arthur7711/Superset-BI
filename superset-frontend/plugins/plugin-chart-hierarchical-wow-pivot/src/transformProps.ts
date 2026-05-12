import {
  ChartProps,
  CurrencyFormatter,
  ensureIsArray,
  getMetricLabel,
  getNumberFormatter,
  QueryFormColumn,
  ValueFormatter,
} from '@superset-ui/core';
import type { SelectedFiltersType } from './types';
import { buildTree } from './features/buildTree';
import {
  TransformedProps,
  MetricConfig,
  MetricFormatType,
} from './types';
import type { MetricFormatsValue } from './components/MetricFormatsControl';

function buildMetricFormatters(
  metricKeys: string[],
  metricFormats: MetricFormatsValue = {},
): { metricFormatters: Record<string, ValueFormatter>; defaultFormatter: ValueFormatter } {
  const defaultFormatter = getNumberFormatter();
  const metricFormatters: Record<string, ValueFormatter> = {};

  metricKeys.forEach(key => {
    const entry = metricFormats[key];
    if (!entry) return;

    const { valueFormat: fmt, currency_format: curr } = entry;
    if (curr?.symbol) {
      metricFormatters[key] = new CurrencyFormatter({
        currency: { symbol: curr.symbol, symbolPosition: curr.symbolPosition ?? 'prefix' },
        d3Format: fmt,
      });
    } else if (fmt) {
      metricFormatters[key] = getNumberFormatter(fmt);
    }
  });

  return { metricFormatters, defaultFormatter };
}

export default function transformProps(
  chartProps: ChartProps,
): TransformedProps {
  const {
    width,
    height,
    queriesData,
    formData,
    rawFormData,
    hooks,
    filterState,
    emitCrossFilters,
    datasource: { columnFormats = {}, currencyFormats = {}, verboseMap = {} },
  } = chartProps;
  const { selectedFilters } = (filterState ?? {}) as {
    selectedFilters?: SelectedFiltersType;
  };
  const normalizeColumnName = (column: QueryFormColumn) =>
    typeof column === 'string' ? column : (column?.label ?? '');
  const rawGroupby: QueryFormColumn[] = ensureIsArray(formData.groupby);
  const rawXAxis: QueryFormColumn | undefined = formData.x_axis;
  const groupbyColumns = rawGroupby
    .map(normalizeColumnName)
    .filter((columnName): columnName is string => Boolean(columnName));
  const hierarchyColumns: string[] = formData.x_axis
    ? Array.from(new Set([...groupbyColumns, formData.x_axis]))
    : groupbyColumns;
  const metricFormats: MetricFormatsValue =
    formData.metricFormats ?? rawFormData?.metric_formats ?? {};

  // Each of the first `groupbyColumns.length` queries corresponds to one level
  // of the hierarchy: query i contains groupby[0..i] + x_axis aggregated rows.
  // Remaining queries (e.g. show_totals) are ignored here.
  const levelCount = Math.max(groupbyColumns.length, 1);
  const perLevelData: Record<string, any>[][] = [];
  for (let i = 0; i < levelCount; i++) {
    perLevelData.push(queriesData?.[i]?.data ?? []);
  }
  const deepestQueryIndex = levelCount - 1;
  const colnames = queriesData?.[deepestQueryIndex]?.colnames || [];
  const groups = hierarchyColumns;
  const fullMetrics = colnames.filter((el: string) => !groups?.includes(el));
  const metricKeys = formData.metrics.map(getMetricLabel);
  const showRootRow = formData.show_root_row ?? true;
  const tree = buildTree(
    perLevelData,
    hierarchyColumns,
    groupbyColumns,
    fullMetrics,
    metricKeys,
    showRootRow,
    formData.xAxis,
    formData.compareLag,
    rawFormData?.extra_form_data?.time_grain_sqla || formData.timeGrainSqla,
  );
  const metrics: MetricConfig[] = metricKeys.map((key: string) => ({
    key,
    label: key,
    formatType: MetricFormatType.Number,
    decimals: 0,
    compact: false,
  }));

  const { metricFormatters, defaultFormatter } = buildMetricFormatters(
    metricKeys,
    metricFormats,
  );

  const revertDeltaMap: Record<string, boolean> = {};
  metricKeys.forEach((key: string) => {
    const entry = metricFormats[key];
    if (entry?.revertDelta) revertDeltaMap[key] = true;
  });

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
    metricFormatters,
    defaultFormatter,
    columnFormats,
    currencyFormats,
    timeGrainSqla: rawFormData?.extra_form_data?.time_grain_sqla || formData.timeGrainSqla,
    revertDeltaMap,
    enabledMetrics: ensureIsArray(
      formData.enabledMetrics ?? rawFormData?.enabled_metrics,
    ),
    setControlValue: hooks?.setControlValue,
    setDataMask: hooks?.setDataMask ?? (() => {}),
    selectedFilters: selectedFilters ?? null,
    emitCrossFilters,
    verboseMap,
    rawGroupby,
    rawXAxis,
  };
}
