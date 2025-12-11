import { useEffect, useRef, useState } from 'react';
import { EchartsHandler } from '../types';
import Echart from '../components/Echart';
import { TimeseriesChartTransformedProps } from './types';
import { ExtraControls } from '../components/ExtraControls';
import { MainBlock } from '../UIWatermark';
import { UserDataWatermark } from '../Watermark/UserDataWatermark';

export default function EchartsTimeseries({
  formData,
  height,
  width,
  echartOptions,
  setControlValue,
  refs,
}: TimeseriesChartTransformedProps) {
  const echartRef = useRef<EchartsHandler | null>(null);
  // eslint-disable-next-line no-param-reassign
  refs.echartRef = echartRef;
  const extraControlRef = useRef<HTMLDivElement>(null);
  const [extraControlHeight, setExtraControlHeight] = useState(0);
  useEffect(() => {
    const updatedHeight = extraControlRef.current?.offsetHeight || 0;
    setExtraControlHeight(updatedHeight);
  }, [formData.showExtraControls]);

  return (
    <MainBlock>
      <div ref={extraControlRef}>
        <ExtraControls formData={formData} setControlValue={setControlValue} />
      </div>
      <UserDataWatermark />
      <Echart
        ref={echartRef}
        refs={refs}
        height={height - extraControlHeight}
        width={width}
        echartOptions={echartOptions}
      />
    </MainBlock>
  );
}
