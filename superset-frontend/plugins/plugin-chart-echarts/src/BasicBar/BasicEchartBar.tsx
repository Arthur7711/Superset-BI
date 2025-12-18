import { useEffect, useRef, useState } from 'react';
import { EchartsHandler } from '../types';
import Echart from '../components/Echart';
import { TimeseriesChartTransformedProps } from './types';
import { ExtraControls } from '../components/ExtraControls';
import { ColumBlock, MainBlock } from '../UIWatermark';
import { UserDataWatermark } from '../Watermark/UserDataWatermark';
import { UpperBlock } from './UIComponents';
import { RenderHeader, RenderHeaderRef } from './components/RenderHeader';
import { colorController } from './helpers/colorController';
import { parseComparisonLags } from './helpers/comperisions';

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
    headerValue,
  } = props;
  // from props get missing values but check how to get data, labelName and more
  const { warningColor, positiveColor, negativeColor } = formData;
  const echartRef = useRef<EchartsHandler | null>(null);
  // eslint-disable-next-line no-param-reassign
  refs.echartRef = echartRef;
  // const extraControlRef = useRef<HTMLDivElement>(null);
  const maxPanelCount =
    echartOptions.length > panelColumns ? panelColumns : echartOptions.length;
  const [extraHeight, setExtraHeight] = useState(0);
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
  const headerRef = useRef<RenderHeaderRef>(null);

  useEffect(() => {
    if (headerRef.current) {
      setExtraHeight(headerRef.current.height);
    }
  }, []);
  const comparisonLags = parseComparisonLags(formData.comparisonLags);
  return (
    <div>
      <UpperBlock cols={maxPanelCount} gap={maxPanelCount > 1 ? 8 : 0}>
        {echartOptions.map(option => (
          <ColumBlock key={option.title?.text || 'echart-column'}>
            <RenderHeader
              ref={headerRef}
              option={option}
              headerFontSize={formData.headerFontSize}
              headerColor={selectedColor}
              showDot={formData.showWarningDot}
              warningColor={warningColor}
              negativeColor={negativeColor}
              positiveColor={positiveColor}
              goalValue={formData.goalValue}
              showGoalProgress={formData.showGoalProgress}
              showGoal={formData.showGoal}
              showGoalPercent={formData.showGoalPercent}
              comparisonLags={comparisonLags}
              comparisonType={formData.comparisonType}
              compareSuffix={formData.compareSuffix}
            />
            {formData.showTrend && (
              <MainBlock>
                <UserDataWatermark />

                <Echart
                  ref={echartRef}
                  refs={refs}
                  height={height - extraHeight}
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
