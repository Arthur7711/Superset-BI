import { HeaderBlock, MetricCount, MetricName } from '../UIComponents';

export const RenderHeader = ({
  option,
  headerFontSize,
  headerColor,
}: {
  option: any;
  headerFontSize: number;
  headerColor: string;
}) => {
  // console.log('option', option);
  const serie = option.series[0];
  const allData = serie.data;
  const lastItem = allData[allData.length - 1][1];
  return (
    <HeaderBlock>
      <MetricName>{serie.name}</MetricName>
      <MetricCount fontSize={headerFontSize} color={headerColor}>
        {lastItem}
      </MetricCount>
    </HeaderBlock>
  );
};
