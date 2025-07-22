import {
  buildQueryContext,
  QueryFormData,
  QueryObject,
} from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { columns } = formData;
  console.log('formDataformData', formData, columns);
  return buildQueryContext(formData, baseQueryObject => {
    const queryObj: QueryObject = {
      ...baseQueryObject,
      is_timeseries: false,
      columns: columns || [],
    };
    return [queryObj];
  });
}
