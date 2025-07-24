import { ChartProps, getCategoricalSchemeRegistry } from '@superset-ui/core';
import * as echarts from 'echarts';

const categories = ['categoryA', 'categoryB', 'categoryC'];
const types = [
  { name: 'JS Heap', color: '#7b9ce1' },
  { name: 'Documents', color: '#bd6d6c' },
  { name: 'Nodes', color: '#75d874' },
  { name: 'Listeners', color: '#e0bc78' },
  { name: 'GPU Memory', color: '#dc77dc' },
  { name: 'GPU', color: '#72b362' },
];
const mockData = [
  {
    name: 'JS Heap',
    value: [0, 1721400000000, 1721400005000, 5000],
    itemStyle: { normal: { color: '#7b9ce1' } },
  },
  {
    name: 'Documents',
    value: [1, 1721400010000, 1721400013000, 3000],
    itemStyle: { normal: { color: '#bd6d6c' } },
  },
  {
    name: 'Nodes',
    value: [2, 1721400020000, 1721400027000, 7000],
    itemStyle: { normal: { color: '#75d874' } },
  },
  {
    name: 'Listeners',
    value: [0, 1721400030000, 1721400034000, 4000],
    itemStyle: { normal: { color: '#e0bc78' } },
  },
  {
    name: 'GPU Memory',
    value: [1, 1721400040000, 1721400048000, 8000],
    itemStyle: { normal: { color: '#dc77dc' } },
  },
  {
    name: 'GPU',
    value: [2, 1721400050000, 1721400052000, 2000],
    itemStyle: { normal: { color: '#72b362' } },
  },
];
const dataConverter = (
  data: {
    category_index: number;
    end_time: number;
    name: string;
    start_time: number;
  }[],
  colorSchemeName = 'SupersetColors',
) => {
  const scheme = getCategoricalSchemeRegistry().get(colorSchemeName);
  const colors = scheme?.colors || [];

  const nameColorMap: { [key: string]: string } = {};
  let colorIndex = 0;

  data.forEach(el => {
    if (!nameColorMap[el.name]) {
      nameColorMap[el.name] = colors[colorIndex % colors.length];
      colorIndex += 1;
    }
  });
  // console.log('queriesData', getCategoricalSchemeRegistry());

  const fixedData = data.map(el => {
    // console.log('queriesData', el);
    const value = {
      name: el.name,
      value: [
        el.category_index,
        el.start_time,
        el.end_time,
        el.end_time - el.start_time,
      ],
      itemStyle: {
        color: nameColorMap[el.name],
      },
    };
    return value;
  });
  // console.log('queriesData', data, fixedData);

  return fixedData;
};
const renderItem = (params: any, api: any) => {
  const categoryIndex = api.value(0);
  const start = api.coord([api.value(1), categoryIndex]);
  const end = api.coord([api.value(2), categoryIndex]);
  const height = api.size([0, 1])[1] * 0.6;
  const rectShape = echarts.graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height,
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height,
    },
  );
  return (
    rectShape && {
      type: 'rect',
      transition: ['shape'],
      shape: rectShape,
      style: api.style(),
    }
  );
};

export default function transformProps(chartProps: ChartProps) {
  const { formData, queriesData, width, height } = chartProps;
  const { columns, colorScheme } = formData;

  const data = queriesData[0]?.data || [];
  console.log('queriesData', formData);
  if (!columns || columns.length === 0) {
    throw new Error('No columns selected');
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `${params.marker} ${params.name}<br/>Duration: ${params.value[3]} ms`,
    },
    grid: {
      height: 250,
    },
    xAxis: {
      scale: true,
      axisLabel: {
        formatter: (val: number) =>
          `${val - dataConverter(data, colorScheme)[0].value[1]} ms`,
      },
    },
    yAxis: {
      type: 'category',
      data: categories,
    },
    series: [
      {
        name: 'Memory Profile',
        type: 'custom',
        renderItem: renderItem,
        itemStyle: {
          opacity: 0.8,
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data: dataConverter(data, colorScheme),
      },
    ],
  };

  return {
    width,
    height,
    echartOptions: option,
  };
}
