import { styled } from '@superset-ui/core';

const periodTextColor = '#999999';
const metricNameColor = '#666666';
export const MainBlock = styled.div`
  position: relative;
`;

export const UpperBlock = styled.div`
  ${({ cols, gap }: { cols: number; gap: number }) => `
 
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  gap: ${gap}px;
  padding: 4px;
  height: 100%;
  box-sizing: border-box;
`}
`;

export const ColumBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
`;

export const HeaderBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  height: 100%;
  overflow: hidden;
  padding-top: 10px;
`;

export const MetricName = styled.span`
  font-size: 10px;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1;
  color: ${metricNameColor};
`;

export const MetricCount = styled.h1`
  ${({ fontSize, color }: { fontSize: number; color?: string }) => `
  font-size: ${fontSize}px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1;
  margin: 2px 0px;
  color: ${color};
  display: flex;
  align-items: center;
  gap: 4px;
`}
`;

export const DotCount = styled.p`
  ${({ fontSize, color }: { fontSize: number; color?: string }) => `
  font-size: ${fontSize}px;
  width: 6px;
  height: 6px;
  background-color: ${color};
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
`}
`;

export const PeriodBlock = styled.span`
  display: flex;
  gap: 3px;
  font-size: 8px;
  color: ${periodTextColor};
  align-items: center;
`;

export const ColoredSquare = styled.span`
  ${({ color }: { color?: string }) => `
  background-color: ${color};
  width: 8px;
  height: 8px;
  border-radius: 2px;
`}
`;

export const PeriodBlocksContainer = styled.div`
  display: flex;
  gap: 10px;
  font-size: 9px;
  margin-bottom: 4px;
`;
