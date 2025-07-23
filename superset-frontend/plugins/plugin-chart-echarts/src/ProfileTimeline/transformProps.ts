import { ChartProps } from '@superset-ui/core';
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

const renderItem = (params: any, api: any) => {
  console.log('paramsApi', params, api);
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
const startTime = +new Date();

export default function transformProps(chartProps: ChartProps) {
  const { formData, queriesData, width, height } = chartProps;
  const { columns } = formData;

  const data = queriesData[0]?.data || [];

  if (!columns || columns.length === 0) {
    throw new Error('No columns selected');
  }
  console.log('queriesData', columns, columns.slice(1));

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.marker} ${params.name}<br/>Duration: ${params.value[3]} ms`;
      },
    },
    grid: {
      height: 250,
    },
    xAxis: {
      scale: true,
      axisLabel: {
        formatter: val => `${(val as number) - mockData[0].value[1]} ms`,
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
        data: mockData,
      },
    ],
  };

  // const option: echarts.EChartsOption = {
  //   tooltip: {
  //     trigger: 'axis',
  //   },
  //   title: {
  //     text: 'Profile',
  //     left: 'center',
  //   },
  //   // dataZoom: [
  //   //   {
  //   //     type: 'slider',
  //   //     filterMode: 'weakFilter',
  //   //     showDataShadow: false,
  //   //     top: 400,
  //   //     labelFormatter: '',
  //   //   },
  //   //   {
  //   //     type: 'inside',
  //   //     filterMode: 'weakFilter',
  //   //   },
  //   // ],
  //   grid: {
  //     height: 300,
  //   },
  //   xAxis: {
  //     min: startTime,
  //     scale: true,
  //     //   axisLabel: {
  //     //     formatter: function (val) {
  //     //       return Math.max(0, val - startTime) + ' ms';
  //     //     },
  //     //   },
  //   },
  //   yAxis: {
  //     data: categories,
  //   },
  //   series: [
  //     {
  //       name: 'Memory Profile',
  //       type: 'custom',
  //       renderItem: renderItem,
  //       itemStyle: {
  //         opacity: 0.8,
  //       },
  //       encode: {
  //         x: [1, 2], // start and end times
  //         y: 0, // category index
  //       },
  //       data: mockData,
  //     },
  //   ],
  //   // series: columns.map(col => ({
  //   //   name: col,
  //   //   type: 'custom',
  //   //   data: data.map(d => {
  //   //     console.log('queriesData', d, d[col]);
  //   //     return d[col];
  //   //   }),
  //   //   renderItem: renderItem,
  //   // })),
  // };

  return {
    width,
    height,
    echartOptions: option,
  };
}
