import { ChartPlugin } from '@superset-ui/core';
import transformProps from './transformProps';
import controlPanel from './controlPanel';
import metadata from './metadata';
import buildQuery from './buildQuery';

export default class ProfileTimelineChartPlugin extends ChartPlugin {
  constructor() {
    super({
      metadata,
      transformProps,
      controlPanel,
      loadChart: () => import('./ProfileTimeline'),
      buildQuery,
    });
  }
}
