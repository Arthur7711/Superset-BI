import {
  ColoredSquare,
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

const factVSplan = 'fact > plan';
const planVSfact = 'fact < plan';

export const RenderHeader = ({
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
}: {
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
}) => {
  // console.log('option', option);
  const serie = option.series[0];
  const allData = serie.data;
  const lastItem = allData[allData.length - 1][1];
  const showDotCondition =
    showDot && (headerColor === warningColor || headerColor === negativeColor);
  const goalProgress =
    showGoal && goalValue ? Math.min((lastItem / goalValue) * 100, 100) : 0;
  return (
    <HeaderBlock>
      <MetricName>{serie.name}</MetricName>
      <MetricCount fontSize={headerFontSize} color={headerColor}>
        {showDotCondition && (
          <DotCount fontSize={headerFontSize} color={headerColor} />
        )}
        {lastItem}
      </MetricCount>
      {showGoalProgress && showGoal && goalValue ? (
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
      ) : null}
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
};
