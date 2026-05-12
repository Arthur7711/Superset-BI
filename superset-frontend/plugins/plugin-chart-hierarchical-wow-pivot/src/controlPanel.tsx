import {
  isAdhocColumn,
  isPhysicalColumn,
  ensureIsArray,
  getMetricLabel,
  QueryFormColumn,
  QueryMode,
  removeDuplicates,
  t,
} from '@superset-ui/core';
import {
  ColumnOption,
  ControlPanelConfig,
  ControlPanelsContainerProps,
  ControlStateMapping,
  sharedControls,
  ControlPanelState,
  ControlState,
  Dataset,
  ColumnMeta,
  defineSavedMetrics,
  getStandardizedControls,
  temporalColumnMixin,
} from '@superset-ui/chart-controls';
import MetricFormatsControl from './components/MetricFormatsControl';

function getQueryMode(controls: ControlStateMapping): QueryMode {
  const mode = controls?.query_mode?.value;
  if (mode === QueryMode.Aggregate || mode === QueryMode.Raw) {
    return mode as QueryMode;
  }
  const rawColumns = controls?.all_columns?.value as
    | QueryFormColumn[]
    | undefined;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? QueryMode.Raw : QueryMode.Aggregate;
}

/**
 * Visibility check
 */
function isQueryMode(mode: QueryMode) {
  return ({ controls }: Pick<ControlPanelsContainerProps, 'controls'>) =>
    getQueryMode(controls) === mode;
}

const isAggMode = isQueryMode(QueryMode.Aggregate);
const isRawMode = isQueryMode(QueryMode.Raw);
const ALLOWED_TIME_GRAINS = new Set(['P1D', 'P1W', 'P1M', 'P3M', 'P1Y']);

// const DEFAULT_TOTAL_GROUPBY = {
//   label: 'Total',
//   sqlExpression: "'Total'",
//   expressionType: 'SQL' as const,
//   hasCustomLabel: true,
//   optionName: 'groupby_total_default',
// };

const validateAggControlValues = (
  controls: ControlStateMapping,
  values: any[],
) => {
  const areControlsEmpty = values.every(val => ensureIsArray(val).length === 0);
  return areControlsEmpty && isAggMode({ controls })
    ? [t('Group By, Metrics or Percentage Metrics must have a value')]
    : [];
};

const allColumnsControl: typeof sharedControls.groupby = {
  ...sharedControls.groupby,
  label: t('Columns'),
  description: t('Columns to display'),
  multi: true,
  freeForm: true,
  allowAll: true,
  commaChoosesOption: false,
  optionRenderer: c => <ColumnOption showType column={c} />,
  valueRenderer: c => <ColumnOption column={c} />,
  valueKey: 'column_name',
  mapStateToProps: ({ datasource, controls }, controlState) => ({
    options: datasource?.columns || [],
    queryMode: getQueryMode(controls),
    externalValidationErrors:
      isRawMode({ controls }) && ensureIsArray(controlState?.value).length === 0
        ? [t('must have a value')]
        : [],
  }),
  visibility: isRawMode,
  resetOnHide: false,
};
const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        ['x_axis'],
        [
          {
            name: 'time_grain_sqla',
            config: {
              ...sharedControls.time_grain_sqla,
              mapStateToProps: (state, controlState) => {
                const originalMapStateToProps =
                  sharedControls.time_grain_sqla.mapStateToProps;
                const mappedState =
                  originalMapStateToProps?.(state, controlState) ?? {};

                return {
                  ...mappedState,
                  choices: ensureIsArray(mappedState.choices).filter(choice => {
                    if (!Array.isArray(choice) || choice.length === 0) {
                      return false;
                    }
                    return ALLOWED_TIME_GRAINS.has(String(choice[0]));
                  }),
                };
              },
              visibility: ({ controls }) => {
                const dttmLookup = Object.fromEntries(
                  ensureIsArray(controls?.groupby?.options).map(option => [
                    option.column_name,
                    option.is_dttm,
                  ]),
                );
                const selections = removeDuplicates([
                  ...ensureIsArray(controls?.groupby?.value),
                  controls?.x_axis?.value,
                ]);

                return selections
                  .map(selection => {
                    if (isAdhocColumn(selection)) {
                      return true;
                    }
                    if (isPhysicalColumn(selection)) {
                      return !!dttmLookup[selection];
                    }
                    return false;
                  })
                  .some(Boolean);
              },
            },
          },
          'temporal_columns_lookup',
        ],
        [
          {
            name: 'groupby',
            override: {
              visibility: isAggMode,
              resetOnHide: false,
              // this new code
              // default: [DEFAULT_TOTAL_GROUPBY],
              // initialValue: (
              //   control: ControlState,
              //   _state: ControlPanelState | null,
              // ) => {
              //   const groups = ensureIsArray(control.value);
              //   const hasTotalGroup = groups.find(group => group?.optionName === 'groupby_total_default');
              //   if (hasTotalGroup) {
              //     return groups;
              //   }else{
              //     return [DEFAULT_TOTAL_GROUPBY,...groups];
              //   }
              // },
              mapStateToProps: (
                state: ControlPanelState,
                controlState: ControlState,
              ) => {
                const { controls } = state;
                const originalMapStateToProps =
                  sharedControls?.groupby?.mapStateToProps;
                const newState =
                  originalMapStateToProps?.(state, controlState) ?? {};
                newState.externalValidationErrors = validateAggControlValues(
                  controls,
                  [
                    controls.metrics?.value,
                    // controls.percent_metrics?.value,
                    controlState.value,
                  ],
                );

                return newState;
              },
              rerender: [
                'metrics',
                'x_axis',
                'time_grain_sqla',
                // , 'percent_metrics'
              ],
              label: t('Hierarchy columns'),
            },
          },
        ],
        [
          {
            name: 'metrics',
            override: {
              validators: [],
              visibility: isAggMode,
              resetOnHide: false,
              mapStateToProps: (
                { controls, datasource, form_data }: ControlPanelState,
                controlState: ControlState,
              ) => ({
                columns: datasource?.columns[0]?.hasOwnProperty('filterable')
                  ? (datasource as Dataset)?.columns?.filter(
                      (c: ColumnMeta) => c.filterable,
                    )
                  : datasource?.columns,
                savedMetrics: defineSavedMetrics(datasource),
                // current active adhoc metrics
                selectedMetrics:
                  form_data.metrics ||
                  (form_data.metric ? [form_data.metric] : []),
                datasource,
                externalValidationErrors: validateAggControlValues(controls, [
                  controls.groupby?.value,
                  // controls.percent_metrics?.value,
                  controlState.value,
                ]),
              }),
              rerender: [
                'groupby',
                'x_axis',
                'time_grain_sqla',
                'metric_formats',
              ],
            },
          },
          {
            name: 'all_columns',
            config: allColumnsControl,
          },
        ],
        ['adhoc_filters'],
        [
          {
            name: 'compare_lag',
            config: {
              type: 'TextControl',
              label: t('Comparison Period Lag'),
              isInt: true,
              description: t(
                'Based on granularity, number of time periods to compare against',
              ),
            },
          },
        ],
        ['row_limit'],
        [
          {
            name: 'enabled_metrics',
            config: {
              type: 'HiddenControl',
              label: t('Enabled metrics'),
              hidden: true,
              description: t(
                'Which metrics are visible in the chart; updated from chart checkboxes',
              ),
              default: [],
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    {
      label: t('Options'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'metric_formats',
            config: {
              type: MetricFormatsControl,
              label: t('Metric Formats'),
              description: t(
                'Configure number format and currency for each metric individually',
              ),
              renderTrigger: true,
              default: {},
              shouldMapStateToProps: () => true,
              mapStateToProps: (state: ControlPanelState) => {
                const allLabels = ensureIsArray(
                  state.controls?.metrics?.value,
                ).map(getMetricLabel);
                const enabled = ensureIsArray(
                  state.controls?.enabled_metrics?.value,
                );
                const filtered =
                  enabled.length > 0
                    ? allLabels.filter(label => enabled.includes(label))
                    : allLabels;
                return { metricLabels: filtered };
              },
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
  controlOverrides: {
    x_axis: {
      label: t('TIME GRAIN COLUMN'),
      ...temporalColumnMixin,
    },
  },
};

export default config;
