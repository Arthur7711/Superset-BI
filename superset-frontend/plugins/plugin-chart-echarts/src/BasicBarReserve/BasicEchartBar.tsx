import { useEffect, useRef, useState } from 'react';
import { EchartsHandler } from '../types';
import Echart from '../components/Echart';
import { TimeseriesChartTransformedProps } from './types';
import { ExtraControls } from '../components/ExtraControls';
import { ColumBlock, MainBlock } from '../UIWatermark';
import { UserDataWatermark } from '../Watermark/UserDataWatermark';
import { UpperBlock } from './UIComponents';

export default function EchartsTimeseries(
  props: TimeseriesChartTransformedProps,
) {
  const {
    width,
    height,
    isPanelMode,
    panelColumns,
    // metricCards,
    // showWarningDot,
    // subheader,
    // dateRange,
    // showDateRange,
    // showTrend,
    // trendChartType,
    // showGoal,
    // goalValue,
    // showGoalProgress,
    // showGoalPercent,
    // showMinMax,
    // showAverageLine,
    // showXAxis,
    // showYAxis,
    // colorOnlyLast,
    // useColorLegend,
    // colorLegend,
    // positiveColor,
    // negativeColor,
    // warningColor,
    // headerFontSize,
    refs,
    formData,
    setControlValue,
    echartOptions,
  } = props;
  const echartRef = useRef<EchartsHandler | null>(null);
  // eslint-disable-next-line no-param-reassign
  refs.echartRef = echartRef;
  const extraControlRef = useRef<HTMLDivElement>(null);
  const [extraControlHeight, setExtraControlHeight] = useState(0);

  useEffect(() => {
    const updatedHeight = extraControlRef.current?.offsetHeight || 0;
    setExtraControlHeight(updatedHeight);
  }, [formData.showExtraControls]);
  const maxPanelCount =
    echartOptions.length > panelColumns ? panelColumns : echartOptions.length;
  return (
    <UpperBlock cols={maxPanelCount} gap={maxPanelCount > 1 ? 8 : 0}>
      {echartOptions.map(option => (
        <ColumBlock key={option.title?.text || 'echart-column'}>
          <MainBlock>
            <div ref={extraControlRef}>
              <ExtraControls
                formData={formData}
                setControlValue={setControlValue}
              />
            </div>
            <UserDataWatermark />

            <Echart
              ref={echartRef}
              refs={refs}
              height={height - extraControlHeight}
              width={width}
              echartOptions={option}
            />
          </MainBlock>
        </ColumBlock>
      ))}
    </UpperBlock>
  );
}
