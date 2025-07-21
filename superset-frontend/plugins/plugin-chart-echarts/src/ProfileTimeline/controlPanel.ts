import { t } from '@superset-ui/core';
import {
  ControlPanelConfig,
  sections,
  sharedControls,
} from '@superset-ui/chart-controls';

console.log('sections', sections);

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Columns'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'category_column',
            config: {
              type: 'SelectControl',
              label: t('Category Column'),
              description: t('Column for category (Y-axis)'),
              clearable: false,
              valueKey: 'column_name',
              labelKey: 'column_name',
              default: null,
              mapStateToProps: state => {
                const columns = state.datasource?.columns ?? [];
                return {
                  options: columns.map(col => ({
                    value: col.column_name,
                    label: col.column_name,
                  })),
                };
              },
            },
          },
        ],
        [
          {
            name: 'start_column',
            config: {
              type: 'SelectControl',
              label: t('Start Time Column'),
              description: t('Column for start timestamp'),
              clearable: false,
              valueKey: 'column_name',
              labelKey: 'column_name',
              default: null,
              mapStateToProps: state => {
                const columns = state.datasource?.columns ?? [];
                return {
                  options: columns.map(col => ({
                    value: col.column_name,
                    label: col.column_name,
                  })),
                };
              },
            },
          },
        ],
        [
          {
            name: 'end_column',
            config: {
              type: 'SelectControl',
              label: t('End Time Column'),
              description: t('Column for end timestamp'),
              clearable: false,
              valueKey: 'column_name',
              labelKey: 'column_name',
              default: null,
              mapStateToProps: state => {
                const columns = state.datasource?.columns ?? [];
                return {
                  options: columns.map(col => ({
                    value: col.column_name,
                    label: col.column_name,
                  })),
                };
              },
            },
          },
        ],
        [
          {
            name: 'type_column',
            config: {
              type: 'SelectControl',
              label: t('Type Column'),
              description: t('Column for colored type label'),
              clearable: false,
              valueKey: 'column_name',
              labelKey: 'column_name',
              default: null,
              mapStateToProps: state => {
                const columns = state.datasource?.columns ?? [];
                return {
                  options: columns.map(col => ({
                    value: col.column_name,
                    label: col.column_name,
                  })),
                };
              },
            },
          },
        ],
      ],
    },
    // sections.legendSection,
    // {
    //   label: t('Legend'),
    //   expanded: true,
    //   controlSetRows: [
    //     [sharedControls.legendPosition],
    //     [sharedControls.showLegend],
    //   ],
    // },
    sections.colorScheme,
  ],
};

export default config;
