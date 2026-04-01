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
  ChartProps,
  DataRecord,
  GenericDataType,
  getMetricLabel,
  Metric,
} from '@superset-ui/core';

interface ColumnData {
  timeLag?: string | number;
}

/**
 * Find the temporal column name from the query response metadata.
 * Falls back to `__timestamp` which is the standard alias for timeseries queries.
 */
function findTemporalColumn(
  colnames?: string[],
  coltypes?: GenericDataType[],
): string {
  if (colnames && coltypes) {
    const idx = coltypes.indexOf(GenericDataType.Temporal);
    if (idx >= 0) {
      return colnames[idx];
    }
  }
  return '__timestamp';
}

/**
 * Pivot flat DataRecord rows into the nested record format expected by TimeTable.jsx.
 *
 * With groupby (single metric, grouped by a column):
 *   Input:  [{ __timestamp: '2021-01-01', country: 'US', 'SUM(rev)': 100 }, ...]
 *   Output: { '2021-01-01': { 'US': 100 }, ... }
 *
 * Without groupby (multiple metrics):
 *   Input:  [{ __timestamp: '2021-01-01', 'SUM(rev)': 100, 'COUNT(*)': 5 }, ...]
 *   Output: { '2021-01-01': { 'SUM(rev)': 100, 'COUNT(*)': 5 }, ... }
 */
function pivotData(
  data: DataRecord[],
  temporalCol: string,
  isGroupBy: boolean,
  groupbyCol: string | null,
  metricLabels: string[],
): { records: Record<string, Record<string, number>>; columns: string[] } {
  const records: Record<string, Record<string, number>> = {};
  const columnSet = new Set<string>();

  data.forEach(row => {
    const timestamp = String(row[temporalCol] ?? '');
    if (!records[timestamp]) {
      records[timestamp] = {};
    }

    if (isGroupBy && groupbyCol) {
      const groupValue = String(row[groupbyCol] ?? '');
      const metricValue = row[metricLabels[0]] as number;
      records[timestamp][groupValue] = metricValue;
      columnSet.add(groupValue);
    } else {
      metricLabels.forEach(label => {
        records[timestamp][label] = row[label] as number;
        columnSet.add(label);
      });
    }
  });

  const columns = Array.from(columnSet).sort();
  return { records, columns };
}

export default function transformProps(chartProps: ChartProps) {
  const { height, datasource, formData, queriesData } = chartProps;
  const { columnCollection = [], groupby, metrics, url } = formData;
  const queryResult = queriesData[0];
  const rawData = (queryResult.data ?? []) as DataRecord[];
  const colnames = queryResult.colnames as string[] | undefined;
  const coltypes = queryResult.coltypes as GenericDataType[] | undefined;

  const isGroupBy = Array.isArray(groupby)
    ? groupby.length > 0
    : Boolean(groupby);
  const groupbyCol = isGroupBy
    ? Array.isArray(groupby)
      ? groupby[0]
      : groupby
    : null;

  const metricLabels: string[] = (metrics ?? []).map((m: unknown) =>
    typeof m === 'string' ? m : getMetricLabel(m as Record<string, unknown>),
  );

  const temporalCol = findTemporalColumn(colnames, coltypes);
  const { records, columns } = pivotData(
    rawData,
    temporalCol,
    isGroupBy,
    groupbyCol,
    metricLabels,
  );

  let rows;
  if (isGroupBy) {
    rows = columns.map(column =>
      typeof column === 'object' ? column : { label: column },
    );
  } else {
    /* eslint-disable no-param-reassign */
    const metricMap = (datasource.metrics ?? []).reduce(
      (acc: Record<string, Metric>, current: Metric) => {
        acc[current.metric_name] = current;
        return acc;
      },
      {} as Record<string, Metric>,
    );
    /* eslint-enable no-param-reassign */
    rows = (metrics ?? []).map((metric: unknown) =>
      typeof metric === 'object' ? metric : metricMap[metric as string],
    );
  }

  // TODO: Better parse this from controls instead of mutative value here.
  columnCollection.forEach((column: unknown) => {
    const c = column as ColumnData;
    if (typeof c.timeLag === 'string' && c.timeLag) {
      c.timeLag = parseInt(c.timeLag, 10);
    }
  });
  console.log('formData', formData);
  return {
    height,
    data: records,
    columnConfigs: columnCollection,
    rows,
    rowType: isGroupBy ? 'column' : 'metric',
    url,
  };
}
