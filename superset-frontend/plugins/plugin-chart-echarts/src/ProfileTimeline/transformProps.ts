import { ChartProps } from '@superset-ui/core';
import { EChartsOption } from 'echarts';

export default function transformProps(chartProps: ChartProps): EChartsOption {
  const { width, height, queriesData } = chartProps;
  const data = queriesData[0].data as Record<string, any>[];

  const categories: string[] = [...new Set(data.map(d => d.group))];
  const startTime = Math.min(...data.map(d => new Date(d.ts_start).getTime()));
  console.log('chartProps', chartProps);
  const colorMap: Record<string, string> = {
    'JS Heap': '#7b9ce1',
    Documents: '#bd6d6c',
    Nodes: '#75d874',
    Listeners: '#e0bc78',
    'GPU Memory': '#dc77dc',
    GPU: '#72b362',
  };

  const timelineData = data.map(row => {
    const start = new Date(row.ts_start).getTime();
    const end = new Date(row.ts_end).getTime();
    const duration = end - start;
    const categoryIndex = categories.indexOf(row.group);
    return {
      name: row.label,
      value: [categoryIndex, start, end, duration],
      itemStyle: {
        color: colorMap[row.type] || '#999',
      },
    };
  });

  const renderItem = (params: any, api: any) => {
    const categoryIndex = api.value(0);
    const startCoord = api.coord([api.value(1), categoryIndex]);
    const endCoord = api.coord([api.value(2), categoryIndex]);
    const height = api.size([0, 1])[1] * 0.6;
    const rectShape = echarts.graphic.clipRectByRect(
      {
        x: startCoord[0],
        y: startCoord[1] - height / 2,
        width: endCoord[0] - startCoord[0],
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

  return {
    tooltip: {
      formatter: (params: any) =>
        `${params.marker}${params.name}: ${params.value[3]} ms`,
    },
    title: {
      text: 'Profile Timeline',
      left: 'center',
    },
    dataZoom: [
      {
        type: 'slider',
        filterMode: 'weakFilter',
        showDataShadow: false,
        top: height - 20,
        labelFormatter: '',
      },
      {
        type: 'inside',
        filterMode: 'weakFilter',
      },
    ],
    grid: { height: height - 100 },
    xAxis: {
      min: startTime,
      scale: true,
      axisLabel: {
        formatter: (val: number) => `${val - startTime} ms`,
      },
    },
    yAxis: {
      data: categories,
    },
    // series: [
    //   {
    //     type: 'custom',
    //     renderItem,
    //     itemStyle: {
    //       opacity: 0.8,
    //     },
    //     encode: {
    //       x: [1, 2],
    //       y: 0,
    //     },
    //     data: timelineData,
    //   },
    // ],
  };
}
