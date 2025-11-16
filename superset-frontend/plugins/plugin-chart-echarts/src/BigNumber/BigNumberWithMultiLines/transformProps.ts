/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  extractTimegrain,
  getNumberFormatter,
  NumberFormats,
  GenericDataType,
  getMetricLabel,
  getXAxisLabel,
  Metric,
  getValueFormatter,
} from '@superset-ui/core';
import { EChartsCoreOption, graphic } from 'echarts/core';
import {
  BigNumberVizProps,
  BigNumberDatum,
  BigNumberWithMultiLinesProps,
  TimeSeriesDatum,
} from '../types';
import { getDateFormatter, parseMetricValue } from '../utils';
import { getDefaultTooltip } from '../../utils/tooltip';
import { Refs } from '../../types';
import { tooltipCustomHtml } from './tooltip';
import { getTimeGrainSqlaFormatter } from './helpers/getTimeGrainSqla';
// import { extractSeries } from '../../utils/series';
// import { rebaseForecastDatum } from '../../utils/forecast';

const formatPercentChange = getNumberFormatter(
  NumberFormats.PERCENT_SIGNED_1_POINT,
);

export default function transformProps(
  chartProps: BigNumberWithMultiLinesProps,
): BigNumberVizProps {
  const {
    width,
    height,
    queriesData,
    formData,
    rawFormData,
    theme,
    hooks,
    inContextMenu,
    datasource: { currencyFormats = {}, columnFormats = {} },
  } = chartProps;
  const {
    colorPicker,
    compareLag: compareLag_,
    compareSuffix = '',
    timeFormat,
    headerFontSize,
    metric = 'value',
    showTimestamp,
    showTrendLine,
    startYAxisAtZero,
    subheader = '',
    subheaderFontSize,
    forceTimestampFormatting,
    yAxisFormat,
    currencyFormat,
    timeRangeFixed,
    secondMetric = 'value',
    timeGrainSqla,
    secondaryColorPicker,
    showFillingArea,
  } = formData;
  const granularity = extractTimegrain(rawFormData);
  const {
    data = [],
    colnames = [],
    coltypes = [],
    from_dttm: fromDatetime,
    to_dttm: toDatetime,
  } = queriesData[0];
  const refs: Refs = {};
  const metricName = getMetricLabel(metric);
  const compareLag = Number(compareLag_) || 0;
  let formattedSubheader = subheader;

  const { r, g, b } = colorPicker;
  const { r: sr, g: sg, b: sb } = secondaryColorPicker;
  const mainColor = `rgb(${r}, ${g}, ${b})`;
  const secondaryColor = `rgb(${sr}, ${sg}, ${sb})`;

  const xAxisLabel = getXAxisLabel(rawFormData) as string;
  let trendLineData: TimeSeriesDatum[] | undefined;
  let percentChange = 0;
  let bigNumber = data.length === 0 ? null : data[0][metricName];
  let timestamp = data.length === 0 ? null : data[0][xAxisLabel];
  let bigNumberFallback;

  const secondMetricName = getMetricLabel(secondMetric);
  let secondTrendLineData: TimeSeriesDatum[] | undefined;

  const metricColtypeIndex = colnames.findIndex(name => name === metricName);

  const metricColtype =
    metricColtypeIndex > -1 ? coltypes[metricColtypeIndex] : null;

  if (data.length > 0) {
    // const hasSecondMetricInData = colnames.includes(secondMetricName);
    if (secondMetric) {
      secondTrendLineData = (data as BigNumberDatum[])
        .map(d => [d[xAxisLabel], parseMetricValue(d[secondMetricName])])
        .filter(d => d[1] !== null && d[0] !== null)
        .sort(
          (a, b) => (a[0] as number) - (b[0] as number),
        ) as TimeSeriesDatum[];
    }

    const sortedData = (data as BigNumberDatum[])
      .map(d => [d[xAxisLabel], parseMetricValue(d[metricName])])
      // sort in time descending order
      .sort((a, b) => (a[0] !== null && b[0] !== null ? b[0] - a[0] : 0));

    bigNumber = sortedData[0][1];
    timestamp = sortedData[0][0];
    if (bigNumber === null) {
      bigNumberFallback = sortedData.find(d => d[1] !== null);
      bigNumber = bigNumberFallback ? bigNumberFallback[1] : null;
      timestamp = bigNumberFallback ? bigNumberFallback[0] : null;
    }

    if (compareLag > 0) {
      const compareIndex = compareLag;
      if (compareIndex < sortedData.length) {
        const compareValue = sortedData[compareIndex][1];
        // compare values must both be non-nulls
        if (bigNumber !== null && compareValue !== null) {
          percentChange = compareValue
            ? (bigNumber - compareValue) / Math.abs(compareValue)
            : 0;
          formattedSubheader = `${formatPercentChange(
            percentChange,
          )} ${compareSuffix}`;
        }
      }
    }
    sortedData.reverse();

    // @ts-ignore
    trendLineData = showTrendLine ? sortedData : undefined;
  }

  let className = '';
  if (percentChange > 0) {
    className = 'positive';
  } else if (percentChange < 0) {
    className = 'negative';
  }

  let metricEntry: Metric | undefined;
  if (chartProps.datasource?.metrics) {
    metricEntry = chartProps.datasource.metrics.find(
      metricEntry => metricEntry.metric_name === metric,
    );
  }

  const formatTime = getDateFormatter(
    timeFormat,
    granularity,
    metricEntry?.d3format,
  );

  const numberFormatter = getValueFormatter(
    metric,
    currencyFormats,
    columnFormats,
    yAxisFormat,
    currencyFormat,
  );

  const headerFormatter =
    metricColtype === GenericDataType.Temporal ||
    metricColtype === GenericDataType.String ||
    forceTimestampFormatting
      ? formatTime
      : numberFormatter;

  if (trendLineData && timeRangeFixed && fromDatetime) {
    const toDatetimeOrToday = toDatetime ?? Date.now();
    if (!trendLineData[0][0] || trendLineData[0][0] > fromDatetime) {
      trendLineData.unshift([fromDatetime, null]);
    }
    if (
      !trendLineData[trendLineData.length - 1][0] ||
      trendLineData[trendLineData.length - 1][0]! < toDatetimeOrToday
    ) {
      trendLineData.push([toDatetimeOrToday, null]);
    }
  }
  const lastTwoPoints = trendLineData?.slice(-2);
  const isOkDiff =
    lastTwoPoints?.length === 2
      ? lastTwoPoints[1][1]! >= lastTwoPoints[0][1]!
      : true;
  const echartOptions: EChartsCoreOption = trendLineData
    ? {
        series: [
          formData.showCustomizeVersion
            ? {
                data: trendLineData,
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: (_: unknown, params: any) =>
                  params.dataIndex === trendLineData.length - 1 ? 10 : 0,
                showSymbol: true,
                color: mainColor,
                areaStyle: showFillingArea
                  ? {
                      color: new graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: mainColor },
                        { offset: 1, color: theme.colors.grayscale.light5 },
                      ]),
                    }
                  : undefined,
                label: {
                  show: true,
                  position: formData.showCustomizeVersion ? 'bottom' : 'top',
                  fontSize: 12,
                  formatter: (params: any) => {
                    // Show label only for the last point
                    const dataLength =
                      params.seriesData?.[0]?.data?.length ??
                      trendLineData.length;
                    let prevValue = 0;
                    if (params.dataIndex === dataLength - 1) {
                      if (dataLength >= 2) {
                        prevValue = trendLineData[dataLength - 2][1] || 0;
                      }
                      const currentValue = params.data[1];
                      const percentChangeValue =
                        (currentValue / prevValue - 1) * 100;
                      const showingPercent = `${
                        percentChange >= 0 ? '+' : ''
                      }${percentChangeValue.toFixed(
                        1,
                      )}% ${getTimeGrainSqlaFormatter(formData.timeGrainSqla)}`;

                      // using rich text style
                      return `{header|${headerFormatter(
                        currentValue,
                      )}} \n {subheader|${showingPercent}}`;
                    }
                    return '';
                  },
                  rich: {
                    header: {
                      fontSize: 14,
                      fontWeight: 'bold',
                      align: 'center',
                      padding: [0, 0, 0, -40],
                    },
                    subheader: {
                      color: formData.makeRevertDeviations
                        ? isOkDiff
                          ? 'red'
                          : 'green'
                        : isOkDiff
                          ? 'green'
                          : 'red',
                      fontSize: 10,
                      fontWeight: 'bold',
                      align: 'center',
                      padding: [0, 0, 0, -90],
                    },
                  },
                },
              }
            : {
                data: trendLineData,
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 10,
                showSymbol: false,
                color: mainColor,
                areaStyle: showFillingArea
                  ? {
                      color: new graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: mainColor },
                        { offset: 1, color: theme.colors.grayscale.light5 },
                      ]),
                    }
                  : undefined,
              },
          ...(secondTrendLineData
            ? [
                {
                  data: secondTrendLineData,
                  type: 'line',
                  smooth: true,
                  symbol: 'diamond',
                  symbolSize: 8,
                  showSymbol: false,
                  color: secondaryColor,
                },
              ]
            : []),
        ],
        xAxis: {
          min: trendLineData[0][0],
          max: trendLineData[trendLineData.length - 1][0],
          show: false,
          type: 'value',
        },
        yAxis: {
          scale: !startYAxisAtZero,
          show: false,
        },
        grid: {
          left: 0,
          right: 0,
          top: 10,
          bottom: 0,
        },
        tooltip: {
          ...getDefaultTooltip(refs),
          show: !inContextMenu,
          trigger: 'axis',
          formatter: (params: any) =>
            tooltipCustomHtml({
              params,
              formatTime,
              headerFormatter,
              allData: data,
              metric: metricName,
              secondMetric: secondMetricName,
              showPlanExec: formData.showPlanExec,
              showTooltipWow: formData.showTooltipMetricWow,
              timeGrainSqla,
              showCustomizeVersion: formData.showCustomizeVersion,
            }),
        },
        aria: {
          enabled: true,
          label: {
            description: `Big number visualization ${subheader}`,
          },
        },
      }
    : {};

  const { onContextMenu } = hooks;

  return {
    width,
    height,
    bigNumber,
    // @ts-ignore
    bigNumberFallback,
    className,
    headerFormatter,
    formatTime,
    formData,
    headerFontSize,
    subheaderFontSize,
    mainColor,
    secondaryColor,
    showTimestamp,
    showTrendLine,
    startYAxisAtZero,
    subheader: formattedSubheader,
    timestamp,
    trendLineData,
    echartOptions,
    onContextMenu,
    xValueFormatter: formatTime,
    refs,
  };
}
