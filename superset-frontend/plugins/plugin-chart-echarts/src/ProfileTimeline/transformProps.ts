import { ChartProps, getCategoricalSchemeRegistry } from '@superset-ui/core';
import * as echarts from 'echarts';

const categories = ['cat_A', 'cat_B', 'cat_C'];

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

  const fixedData = data.map((el, i) => {
    const value = {
      name: el.name,
      value: [
        el.category_index,
        el.start_time,
        el.end_time,
        el.end_time - el.start_time,
      ],
      itemStyle: {
        color: colors[i % colors.length],
      },
    };
    return value;
  });

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
    // @ts-ignore
    series: [
      {
        name: 'Memory Profile',
        type: 'custom',
        // @ts-ignore
        renderItem,
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
