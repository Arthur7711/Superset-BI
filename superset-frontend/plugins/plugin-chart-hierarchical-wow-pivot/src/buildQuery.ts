// import { buildQueryContext } from '@superset-ui/core';
// import { HierarchicalWowFormData } from './types';
// import {
//   isTimeComparison,
//   timeCompareOperator,
// } from '@superset-ui/chart-controls';

// export default function buildQuery(formData: HierarchicalWowFormData) {
//   const { hierarchy_columns: hierarchyColumns, metrics } = formData;
//   return buildQueryContext(formData, baseQueryObject => {
//     const time_offsets = isTimeComparison(formData, baseQueryObject)
//         ? formData.time_compare
//         : [];
//     console.log('hierarchyColumns', formData, baseQueryObject);
//     return [
//       {
//         ...baseQueryObject,
//         columns: hierarchyColumns,
//         metrics,
//         orderby: [],
//         time_offsets,

//       },
//     ]
//   });
// }

import {
  AdhocColumn,
  buildQueryContext,
  ensureIsArray,
  getMetricLabel,
  getTimeOffset,
  isPhysicalColumn,
  parseDttmToDate,
  QueryMode,
  QueryObject,
  removeDuplicates,
  SimpleAdhocFilter,
} from '@superset-ui/core';
import { PostProcessingRule } from '@superset-ui/core/src/query/types/PostProcessing';
import { BuildQuery } from '@superset-ui/core/src/chart/registries/ChartBuildQueryRegistrySingleton';
import {
  isTimeComparison,
  timeCompareOperator,
} from '@superset-ui/chart-controls';
import { isEmpty } from 'lodash';
// import { TableChartFormData } from './types';
// import { updateExternalFormData } from './DataTable/utils/externalAPIs';

type TableChartFormData = any;
/**
 * Infer query mode from form data. If `all_columns` is set, then raw records mode,
 * otherwise defaults to aggregation mode.
 *
 * The same logic is used in `controlPanel` with control values as well.
 */
export function getQueryMode(formData: TableChartFormData) {
  const { query_mode: mode } = formData;
  if (mode === QueryMode.Aggregate || mode === QueryMode.Raw) {
    return mode;
  }
  const rawColumns = formData?.all_columns;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? QueryMode.Raw : QueryMode.Aggregate;
}

const buildQuery: BuildQuery<TableChartFormData> = (
  formData: TableChartFormData,
  options,
) => {
  const {
    // percent_metrics: percentMetrics,
    // order_desc: orderDesc = false,
    extra_form_data,
  } = formData;
  const queryMode = getQueryMode(formData);
  const time_grain_sqla =
    extra_form_data?.time_grain_sqla || formData.time_grain_sqla;
  let formDataCopy = formData;
  // never include time in raw records mode
  if (queryMode === QueryMode.Raw) {
    formDataCopy = {
      ...formData,
      include_time: false,
    };
  }

  return buildQueryContext(formDataCopy, baseQueryObject => {
    let { metrics, orderby = [], columns = [] } = baseQueryObject;
    const { extras = {} } = baseQueryObject;
    let postProcessing: PostProcessingRule[] = [];
    const TimeRangeFilters =
      formData.adhoc_filters?.filter(
        (filter: SimpleAdhocFilter) => filter.operator === 'TEMPORAL_RANGE',
      ) || [];

    // In case the viz is using all version of controls, we try to load them
    const previousCustomTimeRangeFilters: any =
      formData.adhoc_custom?.filter(
        (filter: SimpleAdhocFilter) => filter.operator === 'TEMPORAL_RANGE',
      ) || [];

    let previousCustomStartDate = '';
    if (
      !isEmpty(previousCustomTimeRangeFilters) &&
      previousCustomTimeRangeFilters[0]?.comparator !== 'No Filter'
    ) {
      previousCustomStartDate =
        previousCustomTimeRangeFilters[0]?.comparator.split(' : ')[0];
    }

    const timeOffsets = ensureIsArray(
      isTimeComparison(formData, baseQueryObject)
        ? getTimeOffset({
            timeRangeFilter: {
              ...TimeRangeFilters[0],
              comparator:
                baseQueryObject?.time_range ??
                (TimeRangeFilters[0] as any)?.comparator,
            },
            shifts: formData.time_compare,
            startDate:
              previousCustomStartDate && !formData.start_date_offset
                ? parseDttmToDate(previousCustomStartDate)?.toUTCString()
                : formData.start_date_offset,
          })
        : [],
    );

    let temporalColumnAdded = false;
    let temporalColumn = null;

    if (queryMode === QueryMode.Aggregate) {
      metrics = metrics || [];
      if (metrics?.length > 0) {
        orderby = [[metrics[0], false]];
      }
      // Add the operator for the time comparison if some is selected
      if (!isEmpty(timeOffsets)) {
        postProcessing.push(timeCompareOperator(formData, baseQueryObject));
      }

      const temporalColumnsLookup = formData?.temporal_columns_lookup;
      // Filter out the column if needed and prepare the temporal column object

      columns = columns.filter(col => {
        const shouldBeAdded =
          isPhysicalColumn(col) &&
          time_grain_sqla &&
          temporalColumnsLookup?.[col];

        if (shouldBeAdded && !temporalColumnAdded) {
          temporalColumn = {
            timeGrain: time_grain_sqla,
            columnType: 'BASE_AXIS',
            sqlExpression: col,
            label: col,
            expressionType: 'SQL',
          } as AdhocColumn;
          temporalColumnAdded = true;
          return false; // Do not include this in the output; it's added separately
        }
        return true;
      });

      // So we ensure the temporal column is added first
      if (temporalColumn) {
        columns = [temporalColumn, ...columns];
      }
    }

    const moreProps: Partial<QueryObject> = {};
    const ownState = options?.ownState ?? {};
    if (formDataCopy.server_pagination) {
      moreProps.row_limit =
        ownState.pageSize ?? formDataCopy.server_page_length;
      moreProps.row_offset =
        (ownState.currentPage ?? 0) * (ownState.pageSize ?? 0);
    }

    if (!temporalColumn) {
      // This query is not using temporal column, so it doesn't need time grain
      extras.time_grain_sqla = undefined;
    }

    let queryObject = {
      ...baseQueryObject,
      columns,
      extras,
      orderby,
      metrics,
      post_processing: postProcessing,
      time_offsets: timeOffsets,
      ...moreProps,
    };

    // Because we use same buildQuery for all table on the page we need split them by id
    options?.hooks?.setCachedChanges({
      [formData.slice_id]: queryObject.filters,
    });

    const extraQueries: QueryObject[] = [];
    if (
      metrics?.length &&
      formData.show_totals &&
      queryMode === QueryMode.Aggregate
    ) {
      extraQueries.push({
        ...queryObject,
        columns: [],
        row_limit: 0,
        row_offset: 0,
        post_processing: [],
        order_desc: undefined, // we don't need orderby stuff here,
        orderby: undefined, // because this query will be used for get total aggregation.
      });
    }

    return [queryObject, ...extraQueries];
  });
};

// Use this closure to cache changing of external filters, if we have server pagination we need reset page to 0, after
// external filter changed
export const cachedBuildQuery = (): BuildQuery<TableChartFormData> => {
  let cachedChanges: any = {};
  const setCachedChanges = (newChanges: any) => {
    cachedChanges = { ...cachedChanges, ...newChanges };
  };
  return (formData, options) => {
    return buildQuery(
      { ...formData },
      {
        extras: { cachedChanges },
        ownState: options?.ownState ?? {},
        hooks: {
          ...options?.hooks,
          setDataMask: () => {},
          setCachedChanges,
        },
      },
    );
  };
};

export default cachedBuildQuery();
