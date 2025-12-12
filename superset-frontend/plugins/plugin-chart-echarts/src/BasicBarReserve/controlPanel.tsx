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
import { t, validateNonEmpty } from '@superset-ui/core';
import {
  ControlPanelConfig,
  ControlSetItem,
  ControlSubSectionHeader,
  getStandardizedControls,
  sharedControls,
} from '@superset-ui/chart-controls';

const yAxisShow: ControlSetItem = {
  name: 'y_axis_show',
  config: {
    type: 'CheckboxControl',
    label: t('Show Y Axis Values'),
    renderTrigger: true,
    default: true,
    description: t('Show or hide Y axis tick labels'),
  },
};

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['x_axis'],
        ['time_grain_sqla'],
        [
          {
            name: 'aggregation',
            config: {
              type: 'SelectControl',
              label: t('Aggregation'),
              default: 'LAST_VALUE',
              choices: [
                ['LAST_VALUE', t('Last Value')],
                ['SUM', t('Sum')],
                ['MEAN', t('Mean')],
                ['MIN', t('Minimum')],
                ['MAX', t('Maximum')],
                ['MEDIAN', t('Median')],
              ],
              description: t('Aggregation function to apply on the metric'),
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              validators: [validateNonEmpty],
              description: t(
                'Metrics to display. Multiple metrics create a panel view.',
              ),
            },
          },
        ],
        ['adhoc_filters'],
      ],
    },
    {
      label: t('Display'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'subheader',
            config: {
              type: 'TextControl',
              label: t('Subheader Label'),
              renderTrigger: true,
              description: t('Label shown next to the comparison badge'),
              default: '',
            },
          },
        ],
        [
          {
            name: 'showDateRange',
            config: {
              type: 'CheckboxControl',
              label: t('Show Date Range'),
              renderTrigger: true,
              description: t('Display the date range at the top'),
              default: true,
            },
          },
        ],
        [
          {
            name: 'headerFontSize',
            config: {
              type: 'SliderControl',
              label: t('Big Number Max Font Size'),
              renderTrigger: true,
              min: 24,
              max: 72,
              step: 2,
              default: 36,
              description: t(
                'Maximum font size for the big number (auto-scaled to fit)',
              ),
            },
          },
        ],
        [
          {
            name: 'numberFormat',
            config: {
              type: 'TextControl',
              label: t('Number Format'),
              renderTrigger: true,
              description: t(
                'D3 format string for numbers (e.g., ".1%", "$,.0f")',
              ),
              default: '',
            },
          },
        ],
        [
          {
            name: 'panelColumns',
            config: {
              type: 'SelectControl',
              label: t('Panel Columns'),
              renderTrigger: true,
              choices: [
                [1, '1'],
                [2, '2'],
                [3, '3'],
                [4, '4'],
              ],
              default: 3,
              description: t(
                'Number of columns when displaying multiple metrics',
              ),
            },
          },
        ],
      ],
    },
    {
      label: t('Goal & Coloring'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'showGoal',
            config: {
              type: 'CheckboxControl',
              label: t('Show Goal'),
              renderTrigger: true,
              description: t('Display goal line and color by goal achievement'),
              default: false,
            },
          },
        ],
        [
          {
            name: 'goalValue',
            config: {
              type: 'TextControl',
              label: t('Goal Value'),
              renderTrigger: true,
              description: t('Target value to compare against'),
              default: '',
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.showGoal?.value === true,
            },
          },
        ],
        [
          {
            name: 'showGoalProgress',
            config: {
              type: 'CheckboxControl',
              label: t('Show Progress Bar'),
              renderTrigger: true,
              description: t('Display a progress bar showing actual vs goal'),
              default: false,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.showGoal?.value === true,
            },
          },
          {
            name: 'showGoalPercent',
            config: {
              type: 'CheckboxControl',
              label: t('Show % in Progress Bar'),
              renderTrigger: true,
              description: t('Display percentage inside the progress bar'),
              default: false,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.showGoal?.value === true &&
                controls?.showGoalProgress?.value === true,
            },
          },
        ],
        [
          {
            name: 'useColorLegend',
            config: {
              type: 'CheckboxControl',
              label: t('Use Color Thresholds'),
              renderTrigger: true,
              description: t(
                'Color values based on thresholds (alternative to goal-based coloring)',
              ),
              default: false,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.showGoal?.value !== true,
            },
          },
        ],
        [
          {
            name: 'colorThresholds',
            config: {
              type: 'TextControl',
              label: t('Color Thresholds'),
              renderTrigger: true,
              description: t(
                'Two comma-separated values. E.g., "50,80" means: Red < 50 < Yellow < 80 < Green',
              ),
              default: '50,80',
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.showGoal?.value !== true &&
                controls?.useColorLegend?.value === true,
            },
          },
        ],
        [
          {
            name: 'useColorGradient',
            config: {
              type: 'CheckboxControl',
              label: t('Use Color Gradient'),
              renderTrigger: true,
              description: t(
                'Smooth gradient between colors instead of discrete bands',
              ),
              default: false,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.showGoal?.value === true ||
                controls?.useColorLegend?.value === true,
            },
          },
        ],
        [
          {
            name: 'showWarningDot',
            config: {
              type: 'CheckboxControl',
              label: t('Show Warning Dot'),
              renderTrigger: true,
              description: t(
                'Show colored dot when value is in warning/danger zone',
              ),
              default: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Comparison'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'comparisonType',
            config: {
              type: 'SelectControl',
              label: t('Comparison Type'),
              renderTrigger: true,
              choices: [
                ['none', t('None')],
                ['custom', t('Custom Period Lags')],
                ['avg', t('vs Average')],
                ['goal', t('vs Goal/Target')],
              ],
              default: 'none',
              description: t('Type of comparison to show'),
            },
          },
        ],
        [
          {
            name: 'comparisonLags',
            config: {
              type: 'TextControl',
              label: t('Comparison Period Lags'),
              renderTrigger: false,
              description: t(
                'Format: "1:MoM,12:YoY" or "1,12". Compares against N periods ago.',
              ),
              default: '1:MoM',
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                controls?.comparisonType?.value === 'custom',
            },
          },
        ],
        [
          {
            name: 'compareSuffix',
            config: {
              type: 'TextControl',
              label: t('Comparison Suffix'),
              renderTrigger: true,
              description: t('Suffix after percentage (e.g., "pp", "%")'),
              default: '%',
            },
          },
        ],
      ],
    },
    {
      label: t('Trend Chart'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'showTrend',
            config: {
              type: 'CheckboxControl',
              label: t('Show Trend Chart'),
              renderTrigger: true,
              description: t('Display a trend chart below the big number'),
              default: true,
            },
          },
        ],
        [
          {
            name: 'trendChartType',
            config: {
              type: 'SelectControl',
              label: t('Chart Type'),
              renderTrigger: true,
              choices: [
                ['bar', t('Bar Chart')],
                ['line', t('Line Chart')],
              ],
              default: 'bar',
              description: t('Type of chart for the trend'),
            },
          },
        ],
        [
          {
            name: 'showXAxis',
            config: {
              type: 'CheckboxControl',
              label: t('Show X-Axis'),
              renderTrigger: true,
              description: t('Display X-axis date labels'),
              default: true,
            },
          },
          {
            name: 'showYAxis',
            config: {
              type: 'CheckboxControl',
              label: t('Show Y-Axis'),
              renderTrigger: true,
              description: t('Display Y-axis labels'),
              default: false,
            },
          },
        ],
        [
          {
            name: 'showMinMax',
            config: {
              type: 'CheckboxControl',
              label: t('Show Min/Max'),
              renderTrigger: true,
              description: t('Highlight min and max values'),
              default: false,
            },
          },
          {
            name: 'showAverageLine',
            config: {
              type: 'CheckboxControl',
              label: t('Show Average Line'),
              renderTrigger: true,
              description: t('Display dashed average line'),
              default: false,
            },
          },
        ],
        [
          {
            name: 'colorOnlyLast',
            config: {
              type: 'CheckboxControl',
              label: t('Color Only Last Value'),
              renderTrigger: true,
              description: t(
                'Only color the current value (useful for seasonal comparison)',
              ),
              default: false,
            },
          },
        ],
      ],
    },
    {
      label: t('Colors'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'positiveColor',
            config: {
              type: 'TextControl',
              label: t('Positive Color'),
              renderTrigger: true,
              description: t('Color for positive/good values'),
              default: '#3cc8be',
            },
          },
          {
            name: 'negativeColor',
            config: {
              type: 'TextControl',
              label: t('Negative Color'),
              renderTrigger: true,
              description: t('Color for negative/bad values'),
              default: '#e57373',
            },
          },
        ],
        [
          {
            name: 'warningColor',
            config: {
              type: 'TextControl',
              label: t('Warning Color'),
              renderTrigger: true,
              description: t('Color for warning values'),
              default: '#ffb74d',
            },
          },
        ],
      ],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    metrics: getStandardizedControls().popAllMetrics(),
    groupby: getStandardizedControls().popAllColumns(),
  }),
};

export default config;
