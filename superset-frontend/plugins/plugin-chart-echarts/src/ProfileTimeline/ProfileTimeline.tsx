import React from 'react';
import { EchartsProps } from '../types';
import Echart from '../components/Echart'; // Assuming you have a common Echart wrapper

export default function ProfileTimelineChart(props: EchartsProps) {
  const { height, width, echartOptions } = props;
  console.log('echartOptions', echartOptions);
  return <Echart width={width} height={height} echartOptions={echartOptions} />;
}
