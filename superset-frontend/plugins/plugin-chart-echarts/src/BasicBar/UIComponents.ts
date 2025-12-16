import { styled } from '@superset-ui/core';

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
`;

export const MetricCount = styled.h1`
  ${({ fontSize }: { fontSize: number }) => `
  font-size: ${fontSize}px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1;
  margin: 2px 0px;
`}
`;
