import { styled } from '@superset-ui/core';

export const MainBlock = styled.div`
  position: relative;
`;

export const UpperBlock = styled.h5`
  ${({ cols, gap }: { cols: number; gap: number }) => `
 
  display: grid;
  grid-template-columns: repeat(${cols}, 1fr);
  gap: ${gap}px;
  padding: 4px;
  height: 100%;
  box-sizing: border-box;
`}
`;
