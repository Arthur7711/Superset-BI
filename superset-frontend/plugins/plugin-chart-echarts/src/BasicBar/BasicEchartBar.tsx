import { useEffect, useRef, useState } from 'react';
import { EchartsHandler } from '../types';
import Echart from '../components/Echart';
import { TimeseriesChartTransformedProps } from './types';
import { ExtraControls } from '../components/ExtraControls';
import { ColumBlock, MainBlock } from '../UIWatermark';
import { UserDataWatermark } from '../Watermark/UserDataWatermark';
import { UpperBlock } from './UIComponents';
import { RenderHeader } from './components/RenderHeader';
import { colorController } from './helpers/colorController';

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
    avgValue,
    headerValue,
  } = props;
  const { warningColor, positiveColor, negativeColor } = formData;
  const echartRef = useRef<EchartsHandler | null>(null);
  // eslint-disable-next-line no-param-reassign
  refs.echartRef = echartRef;
  const extraControlRef = useRef<HTMLDivElement>(null);
  const maxPanelCount =
    echartOptions.length > panelColumns ? panelColumns : echartOptions.length;
  const [extraControlHeight, setExtraControlHeight] = useState(0);
  const selectedColor = colorController({
    warningColor,
    positiveColor,
    negativeColor,
    headerValue,
    showGoal: formData.showGoal,
    goalValue: formData.goalValue,
    colorThresholds: formData.colorThresholds,
    useColorLegend: formData.useColorLegend,
  });

  useEffect(() => {
    const updatedHeight = extraControlRef.current?.offsetHeight || 0;
    setExtraControlHeight(updatedHeight);
  }, [formData.showExtraControls]);
  return (
    <div>
      <UpperBlock cols={maxPanelCount} gap={maxPanelCount > 1 ? 8 : 0}>
        {echartOptions.map(option => (
          <ColumBlock key={option.title?.text || 'echart-column'}>
            <RenderHeader
              option={option}
              headerFontSize={formData.headerFontSize}
              headerColor={selectedColor}
              showDot={formData.showWarningDot}
              warningColor={warningColor}
              negativeColor={negativeColor}
              positiveColor={positiveColor}
            />
            {formData.showTrend && (
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
            )}
          </ColumBlock>
        ))}
      </UpperBlock>
    </div>
  );
}
