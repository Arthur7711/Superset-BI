/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.
 */
import { t, ChartMetadata, ChartPlugin, QueryFormData } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

export default class BigNumberCustomChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery: buildQuery as (formData: QueryFormData) => ReturnType<typeof buildQuery>,
      controlPanel,
      loadChart: () => import('./BigNumberCustomViz'),
      metadata: new ChartMetadata({
        category: t('KPI'),
        description: t(
          'Enhanced Big Number with temporal X-axis, aggregation methods, ' +
          'color-coded thresholds, bar/line trend charts, goal tracking, ' +
          'multiple comparison periods (MoM, YoY, custom lags), and warning indicators. ' +
          'Supports multi-metric panel mode for KPI dashboards.',
        ),
        name: t('Big Number Custom'),
        thumbnail,
        tags: [
          t('Business'),
          t('KPI'),
          t('Multi-Metric'),
          t('Trend'),
          t('Comparison'),
          t('Goal Tracking'),
          t('Panel'),
          t('Featured'),
        ],
      }),
      transformProps,
    });
  }
}
