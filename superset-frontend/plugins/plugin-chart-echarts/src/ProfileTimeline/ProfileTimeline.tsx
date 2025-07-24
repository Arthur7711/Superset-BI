import { useRef } from 'react';
import { EchartsProps } from '../types';
import Echart from '../components/Echart'; // Assuming you have a common Echart wrapper

export default function ProfileTimelineChart(props: EchartsProps) {
  const { height, width, echartOptions } = props;
  const chartRef = useRef(null);
  return (
    <Echart
      width={width}
      height={height}
      echartOptions={echartOptions}
      refs={{
        echartRef: chartRef,
      }}
    />
  );
}
