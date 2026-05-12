import { styled } from '@superset-ui/core';

export const MainBlock = styled.div`
  position: relative;
`;
export const ColumBlock = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
`;

export const Watermark = styled.h3`
  position: absolute;
  opacity: 0.05;
  top: 25%;
  left: 30%;
  z-index: 10000;
  pointer-events: none;
`;

export const SmallWatermark = styled.h5`
  ${({
    leftOrigin,
    topOrigin,
    rightOrigin,
    bottomOrigin,
  }: {
    leftOrigin?: string;
    topOrigin?: string;
    rightOrigin?: string;
    bottomOrigin?: string;
    rotate?: string;
  }) => `
  position: absolute;
  opacity: 0.05;
  top: ${topOrigin};
  left: ${leftOrigin};
  right: ${rightOrigin};
  bottom: ${bottomOrigin};
  z-index: 10000;
  font-size: 12px;
  pointer-events: none;
`}
`;
