/* eslint-disable no-underscore-dangle */
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
  AxisType,
  ChartDataResponseResult,
  DataRecord,
  DataRecordValue,
  DTTM_ALIAS,
  ensureIsArray,
  GenericDataType,
  LegendState,
  normalizeTimestamp,
  NumberFormats,
  NumberFormatter,
  SupersetTheme,
  TimeFormatter,
  ValueFormatter,
  getNumberFormatter,
} from '@superset-ui/core';
import { SortSeriesType } from '@superset-ui/chart-controls';
import { format } from 'echarts/core';
import type { LegendComponentOption } from 'echarts/components';
import { color, type SeriesOption } from 'echarts';
import { isEmpty, max, maxBy, meanBy, minBy, orderBy, sumBy } from 'lodash';
import {
  NULL_STRING,
  StackControlsValue,
  TIMESERIES_CONSTANTS,
} from '../constants';
import {
  EchartsTimeseriesSeriesType,
  LabelPositionEnum,
  LegendOrientation,
  LegendType,
  StackType,
} from '../types';
import { defaultLegendPadding } from '../defaults';

const numbersFormatter = getNumberFormatter(NumberFormats.SMART_NUMBER);

function isDefined<T>(value: T | undefined | null): boolean {
  return value !== undefined && value !== null;
}
const BORDER_COLOR = '#FFF';
export function extractDataTotalValues(
  data: DataRecord[],
  opts: {
    stack: StackType;
    percentageThreshold: number;
    xAxisCol: string;
    legendState?: LegendState;
  },
): {
  totalStackedValues: number[];
  thresholdValues: number[];
} {
  const totalStackedValues: number[] = [];
  const thresholdValues: number[] = [];
  const { stack, percentageThreshold, xAxisCol, legendState } = opts;
  if (stack) {
    data.forEach(datum => {
      const values = Object.keys(datum).reduce((prev, curr) => {
        if (curr === xAxisCol) {
          return prev;
        }
        if (legendState && !legendState[curr]) {
          return prev;
        }
        const value = datum[curr] || 0;
        return prev + (value as number);
      }, 0);
      totalStackedValues.push(values);
      thresholdValues.push(((percentageThreshold || 0) / 100) * values);
    });
  }
  return {
    totalStackedValues,
    thresholdValues,
  };
}

export function extractShowValueIndexes(
  series: SeriesOption[],
  opts: {
    stack: StackType;
    onlyTotal?: boolean;
    isHorizontal?: boolean;
    legendState?: LegendState;
  },
): number[] {
  const showValueIndexes: number[] = [];
  const { legendState, stack, isHorizontal, onlyTotal } = opts;
  if (stack) {
    series.forEach((entry, seriesIndex) => {
      const { data = [] } = entry;
      (data as [any, number][]).forEach((datum, dataIndex) => {
        if (entry.id && legendState && !legendState[entry.id]) {
          return;
        }
        if (!onlyTotal && datum[isHorizontal ? 0 : 1] !== null) {
          showValueIndexes[dataIndex] = seriesIndex;
        }
        if (onlyTotal) {
          if (datum[isHorizontal ? 0 : 1] > 0) {
            showValueIndexes[dataIndex] = seriesIndex;
          }
          if (
            !showValueIndexes[dataIndex] &&
            datum[isHorizontal ? 0 : 1] !== null
          ) {
            showValueIndexes[dataIndex] = seriesIndex;
          }
        }
      });
    });
  }
  return showValueIndexes;
}

export function sortAndFilterSeries(
  rows: DataRecord[],
  xAxis: string,
  extraMetricLabels: any[],
  sortSeriesType?: SortSeriesType,
  sortSeriesAscending?: boolean,
): string[] {
  const seriesNames = Object.keys(rows[0])
    .filter(key => key !== xAxis)
    .filter(key => !extraMetricLabels.includes(key));

  let aggregator: (name: string) => { name: string; value: any };

  switch (sortSeriesType) {
    case SortSeriesType.Sum:
      aggregator = name => ({ name, value: sumBy(rows, name) });
      break;
    case SortSeriesType.Min:
      aggregator = name => ({ name, value: minBy(rows, name)?.[name] });
      break;
    case SortSeriesType.Max:
      aggregator = name => ({ name, value: maxBy(rows, name)?.[name] });
      break;
    case SortSeriesType.Avg:
      aggregator = name => ({ name, value: meanBy(rows, name) });
      break;
    default:
      aggregator = name => ({ name, value: name.toLowerCase() });
      break;
  }

  const sortedValues = seriesNames.map(aggregator);

  return orderBy(
    sortedValues,
    ['value'],
    [sortSeriesAscending ? 'asc' : 'desc'],
  ).map(({ name }) => name);
}

export function sortRows(
  rows: DataRecord[],
  totalStackedValues: number[],
  xAxis: string,
  xAxisSortSeries: SortSeriesType,
  xAxisSortSeriesAscending: boolean,
) {
  const sortedRows = rows.map((row, idx) => {
    let sortKey: DataRecordValue = '';
    let aggregate: number | undefined;
    let entries = 0;
    Object.entries(row).forEach(([key, value]) => {
      const isValueDefined = isDefined(value);
      if (key === xAxis) {
        sortKey = value;
      }
      if (
        xAxisSortSeries === SortSeriesType.Name ||
        typeof value !== 'number'
      ) {
        return;
      }

      if (!(xAxisSortSeries === SortSeriesType.Avg && !isValueDefined)) {
        entries += 1;
      }

      switch (xAxisSortSeries) {
        case SortSeriesType.Avg:
        case SortSeriesType.Sum:
          if (aggregate === undefined) {
            aggregate = value;
          } else {
            aggregate += value;
          }
          break;
        case SortSeriesType.Min:
          aggregate =
            aggregate === undefined || (isValueDefined && value < aggregate)
              ? value
              : aggregate;
          break;
        case SortSeriesType.Max:
          aggregate =
            aggregate === undefined || (isValueDefined && value > aggregate)
              ? value
              : aggregate;
          break;
        default:
          break;
      }
    });
    if (
      xAxisSortSeries === SortSeriesType.Avg &&
      entries > 0 &&
      aggregate !== undefined
    ) {
      aggregate /= entries;
    }

    const value =
      xAxisSortSeries === SortSeriesType.Name
        ? typeof sortKey === 'string'
          ? sortKey.toLowerCase()
          : sortKey
        : aggregate;

    return {
      key: sortKey,
      value,
      row,
      totalStackedValue: totalStackedValues[idx],
    };
  });

  return orderBy(
    sortedRows,
    ['value'],
    [xAxisSortSeriesAscending ? 'asc' : 'desc'],
  ).map(({ row, totalStackedValue }) => ({ row, totalStackedValue }));
}

export function extractSeries(
  data: DataRecord[],
  opts: {
    fillNeighborValue?: number;
    xAxis?: string;
    extraMetricLabels?: string[];
    removeNulls?: boolean;
    stack?: StackType;
    totalStackedValues?: number[];
    isHorizontal?: boolean;
    sortSeriesType?: SortSeriesType;
    sortSeriesAscending?: boolean;
    xAxisSortSeries?: SortSeriesType;
    xAxisSortSeriesAscending?: boolean;
  } = {},
): [SeriesOption[], number[], number | undefined] {
  const {
    fillNeighborValue,
    xAxis = DTTM_ALIAS,
    extraMetricLabels = [],
    removeNulls = false,
    stack = false,
    totalStackedValues = [],
    isHorizontal = false,
    sortSeriesType,
    sortSeriesAscending,
    xAxisSortSeries,
    xAxisSortSeriesAscending,
  } = opts;
  if (data.length === 0) return [[], [], undefined];
  const rows: DataRecord[] = data.map(datum => ({
    ...datum,
    [xAxis]: datum[xAxis],
  }));
  const sortedSeries = sortAndFilterSeries(
    rows,
    xAxis,
    extraMetricLabels,
    sortSeriesType,
    sortSeriesAscending,
  );
  const sortedRows =
    isDefined(xAxisSortSeries) && isDefined(xAxisSortSeriesAscending)
      ? sortRows(
          rows,
          totalStackedValues,
          xAxis,
          xAxisSortSeries!,
          xAxisSortSeriesAscending!,
        )
      : rows.map((row, idx) => ({
          row,
          totalStackedValue: totalStackedValues[idx],
        }));

  let minPositiveValue: number | undefined;
  const finalSeries = sortedSeries.map(name => ({
    id: name,
    name,
    data: sortedRows
      .map(({ row, totalStackedValue }, idx) => {
        const currentValue = row[name];
        if (
          typeof currentValue === 'number' &&
          currentValue > 0 &&
          (minPositiveValue === undefined || minPositiveValue > currentValue)
        ) {
          minPositiveValue = currentValue;
        }
        const isNextToDefinedValue =
          isDefined(rows[idx - 1]?.[name]) || isDefined(rows[idx + 1]?.[name]);
        const isFillNeighborValue =
          !isDefined(currentValue) &&
          isNextToDefinedValue &&
          fillNeighborValue !== undefined;
        let value: DataRecordValue | undefined = currentValue;
        if (isFillNeighborValue) {
          value = fillNeighborValue;
        } else if (
          stack === StackControlsValue.Expand &&
          totalStackedValue !== undefined
        ) {
          value = ((value || 0) as number) / totalStackedValue;
        }
        return [row[xAxis], value];
      })
      .filter(obs => !removeNulls || (obs[0] !== null && obs[1] !== null))
      .map(obs => (isHorizontal ? [obs[1], obs[0]] : obs)),
  }));
  return [
    finalSeries,
    sortedRows.map(({ totalStackedValue }) => totalStackedValue),
    minPositiveValue,
  ];
}

export function formatSeriesName(
  name: DataRecordValue | undefined,
  {
    numberFormatter,
    timeFormatter,
    coltype,
  }: {
    numberFormatter?: ValueFormatter;
    timeFormatter?: TimeFormatter;
    coltype?: GenericDataType;
  } = {},
): string {
  if (name === undefined || name === null) {
    return NULL_STRING;
  }
  if (typeof name === 'boolean') {
    return name.toString();
  }
  if (name instanceof Date || coltype === GenericDataType.Temporal) {
    const normalizedName =
      typeof name === 'string' ? normalizeTimestamp(name) : name;
    const d =
      normalizedName instanceof Date
        ? normalizedName
        : new Date(normalizedName);

    return timeFormatter ? timeFormatter(d) : d.toISOString();
  }
  if (typeof name === 'number') {
    return numberFormatter ? numberFormatter(name) : name.toString();
  }
  return name;
}

export const getColtypesMapping = ({
  coltypes = [],
  colnames = [],
}: Pick<ChartDataResponseResult, 'coltypes' | 'colnames'>): Record<
  string,
  GenericDataType
> =>
  colnames.reduce(
    (accumulator, item, index) => ({ ...accumulator, [item]: coltypes[index] }),
    {},
  );

export function extractGroupbyLabel({
  datum = {},
  groupby,
  numberFormatter,
  timeFormatter,
  coltypeMapping = {},
}: {
  datum?: DataRecord;
  groupby?: string[] | null;
  numberFormatter?: NumberFormatter;
  timeFormatter?: TimeFormatter;
  coltypeMapping?: Record<string, GenericDataType>;
}): string {
  return ensureIsArray(groupby)
    .map(val =>
      formatSeriesName(datum[val], {
        numberFormatter,
        timeFormatter,
        ...(coltypeMapping[val] && { coltype: coltypeMapping[val] }),
      }),
    )
    .join(', ');
}

export function getLegendProps(
  type: LegendType,
  orientation: LegendOrientation,
  show: boolean,
  theme: SupersetTheme,
  zoomable = false,
  legendState?: LegendState,
): LegendComponentOption | LegendComponentOption[] {
  const legend: LegendComponentOption | LegendComponentOption[] = {
    orient: [LegendOrientation.Top, LegendOrientation.Bottom].includes(
      orientation,
    )
      ? 'horizontal'
      : 'vertical',
    show,
    type,
    selected: legendState,
    selector: ['all', 'inverse'],
    selectorLabel: {
      fontFamily: theme.typography.families.sansSerif,
      fontSize: theme.typography.sizes.s,
      color: theme.colors.grayscale.base,
      borderColor: theme.colors.grayscale.base,
    },
  };
  switch (orientation) {
    case LegendOrientation.Left:
      legend.left = 0;
      break;
    case LegendOrientation.Right:
      legend.right = 0;
      legend.top = zoomable ? TIMESERIES_CONSTANTS.legendRightTopOffset : 0;
      break;
    case LegendOrientation.Bottom:
      legend.bottom = 0;
      break;
    case LegendOrientation.Top:
    default:
      legend.top = 0;
      legend.right = zoomable ? TIMESERIES_CONSTANTS.legendTopRightOffset : 0;
      break;
  }
  return legend;
}

export function getChartPadding(
  show: boolean,
  orientation: LegendOrientation,
  margin?: string | number | null,
  padding?: { top?: number; bottom?: number; left?: number; right?: number },
  isHorizontal?: boolean,
): {
  bottom: number;
  left: number;
  right: number;
  top: number;
} {
  let legendMargin;
  if (!show) {
    legendMargin = 0;
  } else if (
    margin === null ||
    margin === undefined ||
    typeof margin === 'string'
  ) {
    legendMargin = defaultLegendPadding[orientation];
  } else {
    legendMargin = margin;
  }

  const { bottom = 0, left = 0, right = 0, top = 0 } = padding || {};

  if (isHorizontal) {
    return {
      left:
        left + (orientation === LegendOrientation.Bottom ? legendMargin : 0),
      right:
        right + (orientation === LegendOrientation.Right ? legendMargin : 0),
      top: top + (orientation === LegendOrientation.Top ? legendMargin : 0),
      bottom:
        bottom + (orientation === LegendOrientation.Left ? legendMargin : 0),
    };
  }

  return {
    left: left + (orientation === LegendOrientation.Left ? legendMargin : 0),
    right: right + (orientation === LegendOrientation.Right ? legendMargin : 0),
    top: top + (orientation === LegendOrientation.Top ? legendMargin : 0),
    bottom:
      bottom + (orientation === LegendOrientation.Bottom ? legendMargin : 0),
  };
}

export function dedupLineChartSeries(
  series: SeriesOption[],
  showValue: boolean,
  isHorizontal: boolean,
  width: number,
  isBarChart?: boolean,
  labelPosition?: LabelPositionEnum,
  labelColor?: string,
): SeriesOption[] {
  const counter = new Map<string, number>();
  // @ts-ignore
  return series.map(
    (
      row: SeriesOption & {
        stack: string | undefined;
        itemStyle: { [key: string]: number | string };
        label: {
          [key: string]: number | string;
        };
      },
      i,
    ) => {
      let { id } = row;
      if (id === undefined) return row;
      id = String(id);
      const count = counter.get(id) || 0;
      const suffix = count > 0 ? ` (${count})` : '';
      counter.set(id, count + 1);
      const formatterFn = () => {
        if (row.stack === 'obs' && row.type === 'bar') {
          return {};
        }
        return {
          formatter: ({ data }: { data: number[] }) => {
            const seriesData = series as { data: any[]; name: string }[];
            const index = seriesData[i].data.findIndex(
              (el: number[]) => el[0] === data[0],
            );
            const length = seriesData[i].data.length as number;
            if (index === 0 || index === length - 1) {
              // return data[1];
              return row?.label?.formatter({
                value: data,
                dataIndex: index,
                seriesIndex: i,
                seriesName: seriesData[i].name,
              });
            }
            if (length <= 10) {
              return row?.label?.formatter({
                value: data,
                dataIndex: index,
                seriesIndex: i,
                seriesName: seriesData[i].name,
              });
            }
            if (length > 10 && length <= 30) {
              if (width > 650) {
                return index % 2 === 0
                  ? row?.label?.formatter({
                      value: data,
                      dataIndex: index,
                      seriesIndex: i,
                      seriesName: seriesData[i].name,
                    })
                  : '';
              }
              return index % 3 === 0
                ? row?.label?.formatter({
                    value: data,
                    dataIndex: index,
                    seriesIndex: i,
                    seriesName: seriesData[i].name,
                  })
                : '';
            }
            if (length > 30 && length <= 50) {
              if (width > 650) {
                return index % 3 === 0
                  ? row?.label?.formatter({
                      value: data,
                      dataIndex: index,
                      seriesIndex: i,
                      seriesName: seriesData[i].name,
                    })
                  : '';
              }
              return index % 5 === 0
                ? row?.label?.formatter({
                    value: data,
                    dataIndex: index,
                    seriesIndex: i,
                    seriesName: seriesData[i].name,
                  })
                : '';
            }
            if (length > 50 && length <= 100) {
              return index % 10 === 0
                ? row?.label?.formatter({
                    value: data,
                    dataIndex: index,
                    seriesIndex: i,
                    seriesName: seriesData[i].name,
                  })
                : '';
            }
            if (length > 100) {
              const detectedPercentIndex = Math.floor((length / width) * 100);
              return index % detectedPercentIndex === 0
                ? row?.label?.formatter({
                    value: data,
                    dataIndex: index,
                    seriesIndex: i,
                    seriesName: seriesData[i].name,
                  })
                : '';
            }
            return '';
          },
        };
      };
      const labelOptions = {
        ...row.label,
        show: showValue,
        position: isHorizontal
          ? row.label.position
          : isBarChart
            ? labelPosition
            : 'top',
        ...formatterFn(),
        color: labelColor || row?.label?.color,
      };
      return {
        ...row,
        id: `${id}${suffix}`,
        label: labelOptions,
        itemStyle: {
          ...row.itemStyle,
          borderColor: BORDER_COLOR,
          borderWidth: 0.2,
        },
      };
    },
  );
}

export function dedupBigBarSeries({
  series,
  positiveColor,
  negativeColor,
  warningColor,
  showGoal,
  goalValue,
  colorOnlyLast,
  showMinMax,
  useColorLegend,
  colorThresholds,
  avgValue,
  showAverageLine,
  chartVariant,
}: {
  series: SeriesOption;
  positiveColor: string;
  negativeColor: string;
  warningColor: string;
  showGoal: boolean;
  goalValue: number;
  colorOnlyLast: boolean;
  showMinMax: boolean;
  useColorLegend: boolean;
  colorThresholds?: string;
  avgValue: number | null;
  showAverageLine?: boolean;
  chartVariant: string;
}): SeriesOption[] {
  const counter = new Map<string, number>();
  const grayColor = '#ccc';
  const dashedColor = '#666';
  const avgColor = '#999';
  let { id } = series;
  if (id === undefined) return [series];
  id = String(id);
  const count = counter.get(id) || 0;
  const suffix = count > 0 ? ` (${count})` : '';
  counter.set(id, count + 1);
  const lastIndex = series.data ? series.data.length - 1 : -1;
  const dataValues = series.data?.map((item: [number, number]) => item[1]);
  const lastValue = series.data?.[lastIndex];
  const minValue = Math.min(...dataValues);
  const maxValue = Math.max(...dataValues);

  const minIndex = dataValues.indexOf(minValue);
  const maxIndex = dataValues.indexOf(maxValue);
  const marklineData = {
    symbol: 'none',
    lineStyle: {
      type: 'dashed',
    },
    label: {
      show: false,
    },
    data: [
      {
        yAxis: Number(avgValue),
        lineStyle: {
          color: avgColor,
          width: Number(showAverageLine),
        },
      },
    ],
  };
  const markPointMinMax = showMinMax
    ? [
        {
          type: 'max',
          name: 'Max',
          label: { color: positiveColor, position: 'top' },
          itemStyle: { color: positiveColor },
        },
        {
          type: 'min',
          name: 'Min',
          label: { color: negativeColor, position: 'top' },
          itemStyle: { color: negativeColor },
        },
      ]
    : [];
  const markPoint = {
    silent: true,
    symbol: 'circle',
    symbolSize: 4,
    label: {
      show: true,
      fontSize: 11,
    },
    data: [
      ...markPointMinMax,
      {
        name: 'Last',
        coord: [lastIndex, lastValue],
        label: {
          color: positiveColor,
          position: 'top',
          show: true,
        },
        itemStyle: { color: positiveColor },
      },
    ],
  };
  const lineChartExtraControllers =
    chartVariant === 'line'
      ? {
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: true,
          markPoint,
          lineStyle: {
            color: grayColor,
            width: 1,
          },
        }
      : {};
  if (colorOnlyLast) {
    return [
      {
        ...series,
        id: `${id}${suffix}`,
        itemStyle: {
          ...series.itemStyle,
          color: (params: any) => {
            if (series.data && params.dataIndex === series.data.length - 1) {
              return positiveColor;
            }
            return grayColor;
          },
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 6,
          formatter: (params: any) => {
            if (params.dataIndex === lastIndex) {
              return `{c0|${numbersFormatter(params.value[1])}}`;
            }
            if (showMinMax) {
              if (params.dataIndex === minIndex) {
                return `{c1|${numbersFormatter(minValue)}}`;
              }
              if (params.dataIndex === maxIndex) {
                return `{c2|${numbersFormatter(maxValue)}}`;
              }
            }
            return '';
          },
          rich: {
            c0: { color: positiveColor },
            c1: { color: negativeColor },
            c2: { color: positiveColor },
          },
        },
        markLine: marklineData,
        ...lineChartExtraControllers,
      },
    ];
  }
  if (useColorLegend && colorThresholds) {
    const thresholds = colorThresholds.split(',').map(item => Number(item));
    const [min, max] =
      thresholds.length >= 2
        ? [Math.min(...thresholds), Math.max(...thresholds)]
        : [0, 0];
    return [
      {
        ...series,
        id: `${id}${suffix}`,
        itemStyle: {
          ...series.itemStyle,
          color: (params: any) => {
            if (thresholds.length < 2) {
              return grayColor;
            }
            if (params.data[1] >= max) {
              return positiveColor;
            }
            if (params.data[1] >= min && params.data[1] < max) {
              return warningColor;
            }
            if (params.data[1] < min) {
              return negativeColor;
            }
            return grayColor;
          },
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 6,
          formatter: (params: any) => {
            if (params.dataIndex === lastIndex) {
              return `{c0|${numbersFormatter(params.value[1])}}`;
            }
            if (showMinMax) {
              if (params.dataIndex === minIndex) {
                return `{c1|${numbersFormatter(minValue)}}`;
              }
              if (params.dataIndex === maxIndex) {
                return `{c2|${numbersFormatter(maxValue)}}`;
              }
            }
            return '';
          },
          rich: {
            c0: { color: positiveColor },
            c1: { color: negativeColor },
            c2: { color: positiveColor },
          },
        },
        markLine: marklineData,
        ...lineChartExtraControllers,
      },
    ];
  }
  if (showGoal && goalValue && !colorOnlyLast) {
    return [
      {
        ...series,
        id: `${id}${suffix}`,
        itemStyle: {
          ...series.itemStyle,
          color: (params: any) => {
            if (params.data[1] >= goalValue) {
              return positiveColor;
            }
            if (params.data[1] >= goalValue * 0.8) {
              return warningColor;
            }
            return negativeColor;
          },
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 6,
          // color: (params: any) =>
          //   params.dataIndex === lastIndex ? positiveColor : 'transparent',
          // formatter: (params: any) =>
          //   params.dataIndex === lastIndex
          //     ? numbersFormatter(params.value[1])
          //     : '',
          formatter: (params: any) => {
            if (params.dataIndex === lastIndex) {
              return `{c${
                params.value[1] > goalValue
                  ? 'green'
                  : params.value[1] > goalValue * 0.8
                    ? 'yellow'
                    : 'red'
              }|${numbersFormatter(params.value[1])}}`;
            }
            if (showMinMax) {
              if (params.dataIndex === minIndex) {
                return `{c1|${numbersFormatter(minValue)}}`;
              }
              if (params.dataIndex === maxIndex) {
                return `{c2|${numbersFormatter(maxValue)}}`;
              }
            }
            return '';
          },
          rich: {
            c1: { color: negativeColor },
            c2: { color: positiveColor },
            cgreen: { color: positiveColor },
            cyellow: { color: warningColor },
            cred: { color: negativeColor },
          },
        },
        markLine: {
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            width: 1,
          },
          label: {
            show: false,
          },
          data: [
            {
              yAxis: Number(goalValue),
              lineStyle: {
                color: dashedColor,
              },
            },
            {
              yAxis: Number(avgValue),
              lineStyle: {
                color: avgColor,
                width: Number(showAverageLine),
              },
            },
          ],
        },
        ...lineChartExtraControllers,
      },
    ];
  }
  return [
    {
      ...series,
      id: `${id}${suffix}`,
      itemStyle: {
        ...series.itemStyle,
        color: (params: any) => {
          if (series.data && params.dataIndex === series.data.length - 1) {
            return positiveColor;
          }
          return grayColor;
        },
      },
      label: {
        show: true,
        position: 'top',
        fontSize: 6,
        formatter: (params: any) => {
          if (params.dataIndex === lastIndex) {
            return `{c0|${numbersFormatter(params.value[1])}}`;
          }
          if (showMinMax) {
            if (params.dataIndex === minIndex) {
              return `{c1|${numbersFormatter(minValue)}}`;
            }
            if (params.dataIndex === maxIndex) {
              return `{c2|${numbersFormatter(maxValue)}}`;
            }
          }
          return '';
        },
        rich: {
          c0: { color: positiveColor },
          c1: { color: negativeColor },
          c2: { color: positiveColor },
        },
      },
      markLine: marklineData,
      ...lineChartExtraControllers,
    },
  ];
}

export function dedupSeries(series: SeriesOption[]): SeriesOption[] {
  const counter = new Map<string, number>();
  return series.map((row, i) => {
    let { id } = row;
    if (id === undefined) return row;
    id = String(id);
    const count = counter.get(id) || 0;
    const suffix = count > 0 ? ` (${count})` : '';
    counter.set(id, count + 1);
    return {
      ...row,
      id: `${id}${suffix}`,
    };
  });
}

export function sanitizeHtml(text: string): string {
  return format.encodeHTML(text);
}

export function getAxisType(
  stack: StackType,
  forceCategorical?: boolean,
  dataType?: GenericDataType,
): AxisType {
  if (forceCategorical) {
    return AxisType.Category;
  }
  if (dataType === GenericDataType.Temporal) {
    return AxisType.Time;
  }
  if (dataType === GenericDataType.Numeric && !stack) {
    return AxisType.Value;
  }
  return AxisType.Category;
}

export function getOverMaxHiddenFormatter(
  config: {
    max?: number;
    formatter?: ValueFormatter;
  } = {},
) {
  const { max, formatter } = config;
  // Only apply this logic if there's a MAX set in the controls
  const shouldHideIfOverMax = !!max || max === 0;

  return new NumberFormatter({
    formatFunc: value =>
      `${
        shouldHideIfOverMax && value > max
          ? ''
          : formatter?.format(value) || value
      }`,
    id: NumberFormats.OVER_MAX_HIDDEN,
  });
}

export function calculateLowerLogTick(minPositiveValue: number) {
  const logBase10 = Math.floor(Math.log10(minPositiveValue));
  return Math.pow(10, logBase10);
}

type BoundsType = {
  min?: number | 'dataMin';
  max?: number | 'dataMax';
  scale?: true;
};

export function getMinAndMaxFromBounds(
  axisType: AxisType,
  truncateAxis: boolean,
  min?: number,
  max?: number,
  seriesType?: EchartsTimeseriesSeriesType,
): BoundsType | {} {
  if (axisType === AxisType.Value && truncateAxis) {
    const ret: BoundsType = {};
    if (seriesType === EchartsTimeseriesSeriesType.Bar) {
      ret.scale = true;
    }
    if (min !== undefined) {
      ret.min = min;
    } else if (seriesType !== EchartsTimeseriesSeriesType.Bar) {
      ret.min = 'dataMin';
    }
    if (max !== undefined) {
      ret.max = max;
    } else if (seriesType !== EchartsTimeseriesSeriesType.Bar) {
      ret.max = 'dataMax';
    }
    return ret;
  }
  return {};
}

/**
 * Returns the stackId used in stacked series.
 * It will return the defaultId if the chart is not using time comparison.
 * If time comparison is used, it will return the time comparison value as the stackId
 * if the name includes the time comparison value.
 *
 * @param {string} defaultId The default stackId.
 * @param {string[]} timeCompare The time comparison values.
 * @param {string | number} name The name of the serie.
 *
 * @returns {string} The stackId.
 */
export function getTimeCompareStackId(
  defaultId: string,
  timeCompare: string[],
  name?: string | number,
): string {
  if (isEmpty(timeCompare)) {
    return defaultId;
  }
  // Each timeCompare is its own stack so it doesn't stack on top of original ones
  return (
    timeCompare.find(value => {
      if (typeof name === 'string') {
        // offset is represented as <offset>, group by list
        return (
          name.includes(`${value},`) ||
          // offset is represented as <metric>__<offset>
          name.includes(`__${value}`)
        );
      }
      return name?.toString().includes(value);
    }) || defaultId
  );
}

const TOOLTIP_SERIES_KEY = 'seriesId';
export function extractTooltipKeys(
  forecastValue: any[],
  yIndex: number,
  richTooltip?: boolean,
  tooltipSortByMetric?: boolean,
): string[] {
  if (richTooltip && tooltipSortByMetric) {
    return forecastValue
      .slice()
      .sort((a, b) => b.data[yIndex] - a.data[yIndex])
      .map(value => value[TOOLTIP_SERIES_KEY]);
  }
  if (richTooltip) {
    return forecastValue.map(s => s[TOOLTIP_SERIES_KEY]);
  }
  return [forecastValue[0][TOOLTIP_SERIES_KEY]];
}
