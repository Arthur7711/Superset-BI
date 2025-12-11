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
      label: t('Chart Title'),
      tabOverride: 'customize',
      expanded: true,
      controlSetRows: [
        [<ControlSubSectionHeader>{t('X Axis')}</ControlSubSectionHeader>],
        [<ControlSubSectionHeader>{t('Y Axis')}</ControlSubSectionHeader>],
      ],
    },
    {
      label: t('Chart Options'),
      expanded: true,
      controlSetRows: [['color_scheme']],
    },
  ],
  formDataOverrides: formData => ({
    ...formData,
    metrics: getStandardizedControls().popAllMetrics(),
    groupby: getStandardizedControls().popAllColumns(),
  }),
};

export default config;
