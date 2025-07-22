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
      trigger: 'axis',
    },
    title: {
      text: 'Profile',
      left: 'center',
    },
    // dataZoom: [
    //   {
    //     type: 'slider',
    //     filterMode: 'weakFilter',
    //     showDataShadow: false,
    //     top: 400,
    //     labelFormatter: '',
    //   },
    //   {
    //     type: 'inside',
    //     filterMode: 'weakFilter',
    //   },
    // ],
    grid: {
      height: 300,
    },
    xAxis: {
      min: startTime,
      scale: true,
      //   axisLabel: {
      //     formatter: function (val) {
      //       return Math.max(0, val - startTime) + ' ms';
      //     },
      //   },
    },
    yAxis: {
      data: categories,
    },
    series: columns.map(col => ({
      name: col,
      type: 'custom',
      data: data.map(d => {
        console.log('queriesData', d, d[col]);
        return d[col];
      }),
      renderItem: renderItem,
    })),
    // series: [
    //   {
    //     type: 'custom',
    //     renderItem: renderItem,
    //     itemStyle: {
    //       opacity: 0.8,
    //     },
    //     encode: {
    //       x: [1, 2],
    //       y: 0,
    //     },
    //     data: columns,
    //   },
    // ],
  };

  return {
    width,
    height,
    echartOptions: option,
  };
}
