
import {
  AdhocColumn,
  buildQueryContext,
  ensureIsArray,
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
    extra_form_data,
  } = formData;
  const queryMode = getQueryMode(formData);
  const time_grain_sqla =
    extra_form_data?.time_grain_sqla || formData.time_grain_sqla;
  const selectedXAxis = extra_form_data?.x_axis || formData.x_axis;
  const resolvedXAxis = Array.isArray(selectedXAxis)
    ? selectedXAxis[0]
    : selectedXAxis;
  let formDataCopy = formData;
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

    let temporalColumn: AdhocColumn | null = null;
    let groupbyColumns: any[] = [];

    const resolveLevelColumns = (baseCols: any[]) => {
      const temporalColumnsLookup = formData?.temporal_columns_lookup;
      let levelTemporalColumn: AdhocColumn | null = null;
      const filtered = baseCols.filter(col => {
        const shouldBeAdded =
          isPhysicalColumn(col) &&
          time_grain_sqla &&
          (temporalColumnsLookup?.[col] || formData.granularity_sqla === col);

        if (shouldBeAdded && !levelTemporalColumn) {
          levelTemporalColumn = {
            timeGrain: time_grain_sqla,
            columnType: 'BASE_AXIS',
            sqlExpression: col,
            label: col,
            expressionType: 'SQL',
          } as AdhocColumn;
          return false;
        }
        return true;
      });
      const levelColumns = levelTemporalColumn
        ? [levelTemporalColumn, ...filtered]
        : filtered;
      return { columns: levelColumns, temporalColumn: levelTemporalColumn };
    };

    if (queryMode === QueryMode.Aggregate) {
      groupbyColumns = ensureIsArray(formData.groupby);
      const aggregateColumns = resolvedXAxis
        ? removeDuplicates([...groupbyColumns, resolvedXAxis])
        : groupbyColumns;

      metrics = metrics || [];
      if (metrics?.length > 0) {
        orderby = [[metrics[0], false]];
      }
      if (!isEmpty(timeOffsets)) {
        postProcessing.push(timeCompareOperator(formData, baseQueryObject));
      }

      const deepest = resolveLevelColumns(aggregateColumns);
      columns = deepest.columns;
      temporalColumn = deepest.temporalColumn;
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

    options?.hooks?.setCachedChanges({
      [formData.slice_id]: queryObject.filters,
    });

    const perLevelQueries: QueryObject[] = [];
    if (queryMode === QueryMode.Aggregate && groupbyColumns.length > 1) {
      for (let i = 1; i < groupbyColumns.length; i++) {
        const levelBase = resolvedXAxis
          ? removeDuplicates([...groupbyColumns.slice(0, i), resolvedXAxis])
          : groupbyColumns.slice(0, i);
        const { columns: levelColumns } = resolveLevelColumns(levelBase);
        perLevelQueries.push({
          ...queryObject,
          columns: levelColumns,
        });
      }
    }

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
        order_desc: undefined, // don't need orderby stuff here,
        orderby: undefined, // bcause this query will be used for get total aggregation.
      });
    }

    return [...perLevelQueries, queryObject, ...extraQueries];
  });
};

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
