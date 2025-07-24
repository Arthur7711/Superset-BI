import { t } from '@superset-ui/core';
import { ControlPanelConfig, sections } from '@superset-ui/chart-controls';

const config: ControlPanelConfig = {
  controlPanelSections: [
    sections.legacyTimeseriesTime,
    {
      label: t('Columns'),
      expanded: true,
      controlSetRows: [['granularity'], ['columns']],
    },
    sections.colorScheme,
  ],
  controlOverrides: {
    columns: {
      label: t('Timeline Columns'),
      description: t('Columns to show in timeline'),
      multi: true,
      validators: [],
    },
  },
};

export default config;
