// /**
//  * Licensed to the Apache Software Foundation (ASF) under one
//  * or more contributor license agreements.
//  */
// import { isTimeComparison } from '@superset-ui/chart-controls';
// import {
//   buildQueryContext,
//   ensureIsArray,
//   getXAxisColumn,
//   isXAxisSet,
//   normalizeOrderBy,
//   QueryFormData,
// } from '@superset-ui/core';

// export default function buildQuery(formData: QueryFormData) {
//   const timeColumn = isXAxisSet(formData)
//     ? ensureIsArray(getXAxisColumn(formData))
//     : [];

//   return buildQueryContext(formData, baseQueryObject => {
//     // Get metrics - support both single 'metric' and multiple 'metrics'
//     const metrics =
//       formData.metrics || (formData.metric ? [formData.metric] : []);
//     console.log('timeColumn', timeColumn, baseQueryObject, formData);
//     const time_offsets = isTimeComparison(formData, baseQueryObject)
//       ? formData.time_compare
//       : [];
//     return [
//       {
//         ...baseQueryObject,
//         metrics,
//         columns: [...timeColumn],
//         // If we have a time column, don't use is_timeseries
//         // Otherwise, use is_timeseries to get temporal data
//         ...(timeColumn.length ? {} : { is_timeseries: true }),
//         orderby:
//           timeColumn.length > 0
//             ? [[timeColumn[0], true]] // Order by time ascending
//             : baseQueryObject.orderby,
//       },
//     ];
//   });
// }

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
import {
  buildQueryContext,
  ensureIsArray,
  getXAxisColumn,
  isXAxisSet,
  normalizeOrderBy,
  PostProcessingPivot,
  QueryFormData,
} from '@superset-ui/core';
import {
  contributionOperator,
  extractExtraMetrics,
  flattenOperator,
  isTimeComparison,
  pivotOperator,
  prophetOperator,
  renameOperator,
  resampleOperator,
  rollingWindowOperator,
  sortOperator,
  timeComparePivotOperator,
  timeCompareOperator,
} from '@superset-ui/chart-controls';

export default function buildQuery(formData: QueryFormData) {
  const { groupby } = formData;
  return buildQueryContext(formData, baseQueryObject => {
    const extra_metrics = extractExtraMetrics(formData);

    const pivotOperatorInRuntime: PostProcessingPivot = isTimeComparison(
      formData,
      baseQueryObject,
    )
      ? timeComparePivotOperator(formData, baseQueryObject)
      : pivotOperator(formData, baseQueryObject);

    const columns = [
      ...(isXAxisSet(formData) ? ensureIsArray(getXAxisColumn(formData)) : []),
      ...ensureIsArray(groupby),
    ];

    const time_offsets = isTimeComparison(formData, baseQueryObject)
      ? formData.time_compare
      : [];

    return [
      {
        ...baseQueryObject,
        metrics: [...(baseQueryObject.metrics || []), ...extra_metrics],
        columns,
        series_columns: groupby,
        ...(isXAxisSet(formData) ? {} : { is_timeseries: true }),
        // todo: move `normalizeOrderBy to extractQueryFields`
        orderby: normalizeOrderBy(baseQueryObject).orderby,
        time_offsets,
        /* Note that:
          1. The resample, rolling, cum, timeCompare operators should be after pivot.
          2. the flatOperator makes multiIndex Dataframe into flat Dataframe
        */
        post_processing: [
          pivotOperatorInRuntime,
          rollingWindowOperator(formData, baseQueryObject),
          timeCompareOperator(formData, baseQueryObject),
          resampleOperator(formData, baseQueryObject),
          renameOperator(formData, baseQueryObject),
          contributionOperator(formData, baseQueryObject, time_offsets),
          sortOperator(formData, baseQueryObject),
          flattenOperator(formData, baseQueryObject),
          // todo: move prophet before flatten
          prophetOperator(formData, baseQueryObject),
        ],
      },
    ];
  });
}
