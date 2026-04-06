import { Behavior, ChartMetadata, ChartPlugin, t } from '@superset-ui/core';
import transformProps from './transformProps';
import controlPanel from './controlPanel';
import buildQuery from './buildQuery';

const metadata = new ChartMetadata({
  behaviors: [Behavior.InteractiveChart],
  category: t('Table'),
  description: t(
    'Hierarchical pivot table with Week-over-Week comparison. ' +
      'Shows Current / Δ / Previous / WoW% for multiple metrics across a tree of categories.',
  ),
  name: t('Hierarchical WoW Pivot'),
  tags: [
    t('Business'),
    t('Report'),
    t('Tabular'),
    t('Comparison'),
    t('Featured'),
  ],
  thumbnail: '',
});

export class HierarchicalWowPivotPlugin extends ChartPlugin {
  constructor() {
    super({
      loadChart: () => import('./HierarchicalWowPivot'),
      metadata,
      transformProps,
      controlPanel,
      buildQuery,
    });
  }
}

export default HierarchicalWowPivotPlugin;
