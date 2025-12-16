import {
  ColoredSquare,
  DotCount,
  HeaderBlock,
  MetricCount,
  MetricName,
  PeriodBlock,
  PeriodBlocksContainer,
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
}: {
  option: any;
  headerFontSize: number;
  headerColor: string;
  showDot: boolean;
  warningColor: string;
  negativeColor: string;
  positiveColor: string;
}) => {
  // console.log('option', option);
  const serie = option.series[0];
  const allData = serie.data;
  const lastItem = allData[allData.length - 1][1];
  const showDotCondition =
    showDot && (headerColor === warningColor || headerColor === negativeColor);
  return (
    <HeaderBlock>
      <MetricName>{serie.name}</MetricName>
      <MetricCount fontSize={headerFontSize} color={headerColor}>
        {showDotCondition && (
          <DotCount fontSize={headerFontSize} color={headerColor} />
        )}
        {lastItem}
      </MetricCount>
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
