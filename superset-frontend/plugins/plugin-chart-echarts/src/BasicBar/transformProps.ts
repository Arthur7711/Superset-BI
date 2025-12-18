/* eslint-disable camelcase */
import { invert } from 'lodash';
import {
  AxisType,
  buildCustomFormatters,
  CategoricalColorNamespace,
  CurrencyFormatter,
  ensureIsArray,
  GenericDataType,
  getCustomFormatter,
  getMetricLabel,
  getNumberFormatter,
  getXAxisLabel,
  isDefined,
  isPhysicalColumn,
  t,
  TimeseriesChartDataResponseResult,
  NumberFormats,
} from '@superset-ui/core';
import {
  extractExtraMetrics,
  getOriginalSeries,
  isDerivedSeries,
  getTimeOffset,
} from '@superset-ui/chart-controls';
import type { EChartsCoreOption } from 'echarts/core';
import type { LineStyleOption } from 'echarts/types/src/util/types';
import type { SeriesOption } from 'echarts';
import {
  EchartsTimeseriesChartProps,
  EchartsTimeseriesFormData,
  OrientationType,
  TimeseriesChartTransformedProps,
} from './types';
import { DEFAULT_FORM_DATA } from '../Timeseries/constants';
import { LegendType, Refs } from '../types';
import { parseAxisBound } from '../utils/controls';
import {
  dedupBigBarSeries,
  extractDataTotalValues,
  extractSeries,
  extractShowValueIndexes,
  getAxisType,
  getColtypesMapping,
  getLegendProps,
  getMinAndMaxFromBounds,
} from '../utils/series';
import { getAnnotationData } from '../utils/annotation';
import {
  extractForecastSeriesContexts,
  rebaseForecastDatum,
} from '../utils/forecast';
import { convertInteger } from '../utils/convertInteger';
import { defaultYAxis } from '../defaults';
import { getPadding, transformSeries } from '../Timeseries/transformers';
import { StackControlsValue, TIMEGRAIN_TO_TIMESTAMP } from '../constants';
// import { getDefaultTooltip } from '../utils/tooltip';
import {
  getPercentFormatter,
  getXAxisFormatter,
  getYAxisFormatter,
} from '../utils/formatters';

export default function transformProps(
  chartProps: EchartsTimeseriesChartProps,
): TimeseriesChartTransformedProps {
  const {
    width,
    height,
    filterState,
    legendState,
    formData,
    hooks,
    queriesData,
    datasource,
    theme,
    // inContextMenu,
    emitCrossFilters,
  } = chartProps;

  const {
    verboseMap = {},
    columnFormats = {},
    currencyFormats = {},
  } = datasource;
  const [queryData] = queriesData;
  const { data = [], label_map = {} } =
    queryData as TimeseriesChartDataResponseResult;

  const dataTypes = getColtypesMapping(queryData);
  const {
    area,
    // annotationLayers,
    colorScheme,
    contributionMode,
    forecastEnabled,
    groupby,
    legendOrientation,
    // legendType,
    legendMargin,
    logAxis,
    markerEnabled,
    markerSize,
    metrics,
    minorSplitLine,
    minorTicks,
    onlyTotal,
    opacity,
    orientation,
    percentageThreshold,
    richTooltip,
    seriesType,
    showLegend,
    showValue,
    sliceId,
    sortSeriesType,
    sortSeriesAscending,
    timeGrainSqla,
    timeCompare,
    stack,
    // tooltipTimeFormat,
    // tooltipSortByMetric,
    // showTooltipTotal,
    // showTooltipPercentage,
    truncateXAxis,
    truncateYAxis,
    xAxis: xAxisOrig,
    xAxisBounds,
    xAxisForceCategorical,
    xAxisLabelRotation,
    xAxisSortSeries,
    xAxisSortSeriesAscending,
    xAxisTimeFormat,
    xAxisTitle,
    xAxisTitleMargin,
    // yAxisBounds,
    yAxisFormat,
    currencyFormat,
    yAxisTitle,
    yAxisTitleMargin,
    yAxisTitlePosition,
    // labelPosition,
    // labelColor,
    zoomable,
  }: EchartsTimeseriesFormData = { ...DEFAULT_FORM_DATA, ...formData };
  const refs: Refs = {};
  const groupBy = ensureIsArray(groupby);
  const labelMap: { [key: string]: string[] } = Object.entries(
    label_map,
  ).reduce((acc, entry) => {
    if (
      entry[1].length > groupBy.length &&
      Array.isArray(timeCompare) &&
      timeCompare.includes(entry[1][0])
    ) {
      entry[1].shift();
    }
    return { ...acc, [entry[0]]: entry[1] };
  }, {});
  const colorScale = CategoricalColorNamespace.getScale(colorScheme as string);
  const rebasedData = rebaseForecastDatum(data, verboseMap);
  let xAxisLabel = getXAxisLabel(chartProps.rawFormData) as string;
  if (
    isPhysicalColumn(chartProps.rawFormData?.x_axis) &&
    isDefined(verboseMap[xAxisLabel])
  ) {
    xAxisLabel = verboseMap[xAxisLabel];
  }
  const isHorizontal = orientation === OrientationType.Horizontal;
  const { totalStackedValues, thresholdValues } = extractDataTotalValues(
    rebasedData,
    {
      stack,
      percentageThreshold,
      xAxisCol: xAxisLabel,
      legendState,
    },
  );
  const extraMetricLabels = extractExtraMetrics(chartProps.rawFormData).map(
    getMetricLabel,
  );
  const isMultiSeries = groupBy.length || metrics?.length > 1;

  const [rawSeries, sortedTotalValues, minPositiveValue] = extractSeries(
    rebasedData,
    {
      fillNeighborValue: stack && !forecastEnabled ? 0 : undefined,
      xAxis: xAxisLabel,
      extraMetricLabels,
      stack,
      totalStackedValues,
      isHorizontal,
      sortSeriesType,
      sortSeriesAscending,
      xAxisSortSeries: isMultiSeries ? xAxisSortSeries : undefined,
      xAxisSortSeriesAscending: isMultiSeries
        ? xAxisSortSeriesAscending
        : undefined,
    },
  );

  const showValueIndexes = extractShowValueIndexes(rawSeries, {
    stack,
    onlyTotal,
    isHorizontal,
    legendState,
  });
  const seriesContexts = extractForecastSeriesContexts(
    rawSeries.map(series => series.name as string),
  );
  const isAreaExpand = stack === StackControlsValue.Expand;
  const xAxisDataType = dataTypes?.[xAxisLabel] ?? dataTypes?.[xAxisOrig];

  const xAxisType = getAxisType(stack, xAxisForceCategorical, xAxisDataType);
  const series: SeriesOption[] = [];

  const forcePercentFormatter = Boolean(contributionMode || isAreaExpand);
  const percentFormatter = forcePercentFormatter
    ? getPercentFormatter(yAxisFormat)
    : getPercentFormatter(NumberFormats.PERCENT_2_POINT);
  const defaultFormatter = currencyFormat?.symbol
    ? new CurrencyFormatter({ d3Format: yAxisFormat, currency: currencyFormat })
    : getNumberFormatter(yAxisFormat);
  const customFormatters = buildCustomFormatters(
    metrics,
    currencyFormats,
    columnFormats,
    yAxisFormat,
    currencyFormat,
  );

  const array = ensureIsArray(chartProps.rawFormData?.time_compare);
  const inverted = invert(verboseMap);

  const offsetLineWidths = {};

  rawSeries.forEach(entry => {
    const derivedSeries = isDerivedSeries(entry, chartProps.rawFormData);
    const lineStyle: LineStyleOption = {};
    if (derivedSeries) {
      const offset = getTimeOffset(
        entry,
        ensureIsArray(chartProps.rawFormData?.time_compare),
      )!;
      if (!offsetLineWidths[offset]) {
        offsetLineWidths[offset] = Object.keys(offsetLineWidths).length + 1;
      }
      lineStyle.type = 'dashed';
      lineStyle.width = offsetLineWidths[offset];
    }

    const entryName = String(entry.name || '');
    const seriesName = inverted[entryName] || entryName;
    const colorScaleKey = getOriginalSeries(seriesName, array);
    const transformedSeries = transformSeries(
      entry,
      colorScale,
      colorScaleKey,
      {
        area,
        connectNulls: derivedSeries,
        filterState,
        seriesContexts,
        markerEnabled,
        markerSize,
        areaOpacity: opacity,
        seriesType,
        legendState,
        stack,
        formatter: forcePercentFormatter
          ? percentFormatter
          : getCustomFormatter(
              customFormatters,
              metrics,
              labelMap?.[seriesName]?.[0],
            ) ?? defaultFormatter,
        showValue,
        onlyTotal,
        totalStackedValues: sortedTotalValues,
        showValueIndexes,
        thresholdValues,
        richTooltip,
        sliceId,
        isHorizontal,
        lineStyle,
        timeCompare: array,
      },
    );
    if (transformedSeries) {
      if (stack === StackControlsValue.Stream) {
        // bug in Echarts - `stackStrategy: 'all'` doesn't work with nulls, so we cast them to 0
        series.push({
          ...transformedSeries,
          data: (transformedSeries.data as any).map(
            (row: [string | number, number]) => [row[0], row[1] ?? 0],
          ),
        });
      } else {
        series.push(transformedSeries);
      }
    }
  });

  // axis bounds need to be parsed to replace incompatible values with undefined
  const [xAxisMin, xAxisMax] = (xAxisBounds || []).map(parseAxisBound);

  const xAxisFormatter =
    xAxisDataType === GenericDataType.Temporal
      ? getXAxisFormatter(xAxisTimeFormat)
      : String;
  const addYAxisLabelOffset = !!yAxisTitle;
  const addXAxisLabelOffset = !!xAxisTitle;
  const padding = getPadding(
    showLegend,
    legendOrientation,
    addYAxisLabelOffset,
    zoomable,
    legendMargin,
    addXAxisLabelOffset,
    yAxisTitlePosition,
    convertInteger(yAxisTitleMargin),
    convertInteger(xAxisTitleMargin),
    isHorizontal,
  );
  let xAxis: any = {
    type: xAxisType,
    name: xAxisTitle,
    nameGap: convertInteger(xAxisTitleMargin),
    nameLocation: 'middle',
    axisLabel: {
      hideOverlap: true,
      formatter: xAxisFormatter,
      rotate: xAxisLabelRotation,
    },
    minorTick: { show: minorTicks },
    show: formData.showXAxis,
    minInterval:
      xAxisType === AxisType.Time && timeGrainSqla
        ? TIMEGRAIN_TO_TIMESTAMP[
            timeGrainSqla as keyof typeof TIMEGRAIN_TO_TIMESTAMP
          ]
        : 0,
    ...getMinAndMaxFromBounds(
      xAxisType,
      truncateXAxis,
      xAxisMin,
      xAxisMax,
      seriesType,
    ),
  };
  let yAxis: any = {
    ...defaultYAxis,
    type: logAxis ? AxisType.Log : AxisType.Value,
    minorTick: { show: minorTicks },
    minorSplitLine: { show: minorSplitLine },
    axisLabel: {
      formatter: getYAxisFormatter(
        metrics,
        forcePercentFormatter,
        customFormatters,
        defaultFormatter,
        yAxisFormat,
      ),
    },
    show: formData.showYAxis,
    scale: truncateYAxis,
    name: yAxisTitle,
    nameGap: convertInteger(yAxisTitleMargin),
    nameLocation: yAxisTitlePosition === 'Left' ? 'middle' : 'end',
    splitLine: {
      show: false,
    },
  };
  if (isHorizontal) {
    [xAxis, yAxis] = [yAxis, xAxis];
    [padding.bottom, padding.left] = [padding.left, padding.bottom];
  }
  // console.log('series, ', series);
  const isPanelMode = series.length > 1;
  const echartOptions: EChartsCoreOption[] = series.map(serie => {
    const chartValues = serie.data?.map(
      (d: [number, number]) => d[1],
    ) as number[];
    const avgValue =
      chartValues.length > 0
        ? chartValues.reduce((a, b) => a + b, 0) / chartValues.length
        : null;
    return {
      useUTC: true,
      xAxis,
      yAxis,
      series: dedupBigBarSeries({
        series: serie,
        positiveColor: formData.positiveColor,
        negativeColor: formData.negativeColor,
        warningColor: formData.warningColor,
        showGoal: formData.showGoal,
        goalValue: formData.goalValue,
        colorOnlyLast: formData.colorOnlyLast,
        showMinMax: formData.showMinMax,
        colorThresholds: formData.colorThresholds,
        useColorLegend: formData.useColorLegend,
        avgValue,
        showAverageLine: formData.showAverageLine,
      }),
      tooltip: {
        trigger: 'axis',
      },
      avgValue,
    };
  });

  return {
    echartOptions,
    formData,
    height,
    width,
    refs,
    isPanelMode,
    panelColumns: formData.panelColumns,
    headerValue: series[0].data[series[0].data.length - 1][1] as number,
    metricName: series[0].name,
    metricData: series[0].data,
  };
}
