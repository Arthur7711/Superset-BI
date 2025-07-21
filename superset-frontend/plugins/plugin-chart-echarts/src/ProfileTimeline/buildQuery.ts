import {
  buildQueryContext,
  QueryFormData,
  QueryObject,
} from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { category_column, start_column, end_column, type_column } = formData;
  console.log(
    'formDataformData',
    formData,
    category_column,
    start_column,
    end_column,
    type_column,
  );
  return buildQueryContext(formData, baseQueryObject => {
    const queryObj: QueryObject = {
      ...baseQueryObject,
      is_timeseries: false,
      columns: [category_column, start_column, end_column, type_column],
    };
    return [queryObj];
  });
}
