import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
} from 'react';

import {
  ColoredSquare,
  ComparisonsBlock,
  DotCount,
  GoalPercentSpan,
  GoalValueText,
  GraySpan,
  HeaderBlock,
  MetricCount,
  MetricName,
  PeriodBlock,
  PeriodBlocksContainer,
  ProgressBar,
  ProgressBarContainer,
  ProgressMainBlock,
} from '../UIComponents';
import { calculateComparisons, ComparisonLag } from '../helpers/comperisions';

const factVSplan = 'fact > plan';
const planVSfact = 'fact < plan';

export type RenderHeaderRef = {
  height: number;
};
// ComparisonResult
const formatComparison = (comp: any): string => {
  if (comp.value === null) return '';
  const prefix = comp.value >= 0 ? '↑+' : '↓';
  return `${prefix}${Math.abs(comp.value).toFixed(1)}% ${comp.label}`;
};

export const RenderHeader = forwardRef<
  RenderHeaderRef,
  {
    option: any;
    headerFontSize: number;
    headerColor: string;
    showDot: boolean;
    warningColor: string;
    negativeColor: string;
    positiveColor: string;
    goalValue: number;
    showGoalProgress?: boolean;
    showGoal?: boolean;
    showGoalPercent?: boolean;
    avgValue: number | null;
    comparisonLags: ComparisonLag[];
    comparisonType: string;
    compareSuffix: string;
  }
>(
  (
    {
      option,
      headerFontSize,
      headerColor,
      showDot,
      warningColor,
      negativeColor,
      positiveColor,
      goalValue,
      showGoalProgress,
      showGoal,
      showGoalPercent,
      avgValue,
      comparisonLags,
      comparisonType,
      compareSuffix,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    let height = 0;

    // for getting height
    useLayoutEffect(() => {
      if (containerRef.current) {
        height = containerRef.current.getBoundingClientRect().height;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      get height() {
        return containerRef.current
          ? containerRef.current.getBoundingClientRect().height
          : 0;
      },
    }));

    const serie = option.series[0];
    const allData = serie.data;
    const lastItem = allData[allData.length - 1][1];

    const showDotCondition =
      showDot &&
      (headerColor === warningColor || headerColor === negativeColor);

    const goalProgress =
      showGoal && goalValue ? Math.min((lastItem / goalValue) * 100, 100) : 0;

    const comparisons = calculateComparisons(
      option.series[0].data,
      option.series[0].name,
      comparisonType,
      comparisonLags,
      avgValue,
      goalValue,
      compareSuffix,
    );

    console.log(
      'metricCards',
      comparisons,
      // option.series[0],
      // data: option.series[0].data,
      // metricLabel: option.series[0].name,
      // comparisonType,
      // comparisonLags,
      // avgValue,
      // goalValue,
      // compareSuffix,
    );
    return (
      <HeaderBlock ref={containerRef}>
        <MetricName>{serie.name}</MetricName>

        <MetricCount fontSize={headerFontSize} color={headerColor}>
          {showDotCondition && (
            <DotCount fontSize={headerFontSize} color={headerColor} />
          )}
          {lastItem}
        </MetricCount>
        {comparisons.length > 0 && (
          <ComparisonsBlock>
            {comparisons.map((comp, idx) => (
              <span key={idx}>{formatComparison(comp)}</span>
            ))}
          </ComparisonsBlock>
        )}
        {showGoalProgress && showGoal && goalValue && (
          <ProgressMainBlock>
            <GraySpan>0</GraySpan>
            <ProgressBarContainer>
              <ProgressBar
                goalProgress={goalProgress}
                positiveColor={positiveColor}
              >
                {showGoalPercent && goalProgress > 25 && (
                  <GoalPercentSpan>{goalProgress.toFixed(0)}%</GoalPercentSpan>
                )}
              </ProgressBar>
            </ProgressBarContainer>
            <GraySpan>plan</GraySpan>
            <GoalValueText>{goalValue}</GoalValueText>
          </ProgressMainBlock>
        )}

        <PeriodBlocksContainer>
          <PeriodBlock>
            <ColoredSquare color={positiveColor} />
            {factVSplan}
          </PeriodBlock>
          <PeriodBlock>
            <ColoredSquare color={negativeColor} />
            {planVSfact}
          </PeriodBlock>
        </PeriodBlocksContainer>
      </HeaderBlock>
    );
  },
);

RenderHeader.displayName = 'RenderHeader';
