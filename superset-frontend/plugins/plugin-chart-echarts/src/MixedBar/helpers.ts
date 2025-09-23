import {
  DTTM_ALIAS,
  DataRecord,
  DataRecordValue,
  isDefined,
} from '@superset-ui/core';
import { SortSeriesType } from '@superset-ui/chart-controls';
import { SeriesOption } from 'echarts';
import { StackType } from '../types';
import { sortRows } from '../utils/series';
import { StackControlsValue } from '../constants';

export function customDedupSeries(
  series: SeriesOption[],
): [SeriesOption[], SeriesOption | undefined] {
  const counter = new Map<string, number>();
  const secondaryBarColor = '#cccccc';
  // const primaryBarColor = '#6E00F7';
  const customStyles = [
    {
      itemStyle: { color: secondaryBarColor },
      barWidth: 10,
      z: 1,
    },
    {
      // itemStyle: { color: primaryBarColor },
      barWidth: 4,
      z: 2,
      barGap: '-70%',
    },
  ];
  const data = series.map((row, index) => {
    if (row?.id === undefined) return row;
    let { id } = row;
    id = String(id);
    const count = counter.get(id) || 0;
    const suffix = count > 0 ? ` (${count})` : '';
    counter.set(id, count + 1);
    return {
      ...row,
      id: `${id}${suffix}`,
      ...customStyles[index],
    };
  });

  return [data.slice(0, 2), data?.[2]];
}

export function extractSeries(
  data: DataRecord[],
  metrics: string[],
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
    removeNulls = false,
    stack = false,
    totalStackedValues = [],
    isHorizontal = false,
    xAxisSortSeries,
    xAxisSortSeriesAscending,
  } = opts;
  if (data.length === 0) return [[], [], undefined];
  const rows: DataRecord[] = data.map(datum => ({
    ...datum,
    [xAxis]: datum[xAxis],
  }));
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
  const finalSeries = metrics.map(name => ({
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
