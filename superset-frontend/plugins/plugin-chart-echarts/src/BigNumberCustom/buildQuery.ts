/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.
 */
import {
  buildQueryContext,
  ensureIsArray,
  getXAxisColumn,
  isXAxisSet,
  QueryFormData,
} from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const timeColumn = isXAxisSet(formData)
    ? ensureIsArray(getXAxisColumn(formData))
    : [];

  return buildQueryContext(formData, baseQueryObject => {
    // Get metrics - support both single 'metric' and multiple 'metrics'
    const metrics = formData.metrics || (formData.metric ? [formData.metric] : []);
    
    return [
      {
        ...baseQueryObject,
        metrics,
        columns: [...timeColumn],
        // If we have a time column, don't use is_timeseries
        // Otherwise, use is_timeseries to get temporal data
        ...(timeColumn.length ? {} : { is_timeseries: true }),
        orderby: timeColumn.length > 0 
          ? [[timeColumn[0], true]] // Order by time ascending
          : baseQueryObject.orderby,
      },
    ];
  });
}
