import { SeriesOption } from 'echarts';

export function customDedupSeries(series: SeriesOption[]): SeriesOption[] {
  const counter = new Map<string, number>();
  const customStyles = [
    { itemStyle: { color: '#cccccc' }, barWidth: 10, z: 1 },
    {
      itemStyle: { color: '#6E00F7' },
      barWidth: 5,
      z: 2,
      barGap: '-75%',
    },
  ];
  const data = series.map((row, index) => {
    let { id } = row;
    if (id === undefined) return row;
    id = String(id);
    const count = counter.get(id) || 0;
    const suffix = count > 0 ? ` (${count})` : '';
    counter.set(id, count + 1);
    return {
      ...row,
      id: `${id}${suffix}`,
      ...customStyles[index],
    };
  });
  return data;
}
