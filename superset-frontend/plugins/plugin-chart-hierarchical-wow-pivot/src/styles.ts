import { styled } from '@superset-ui/core';


export const StyledContainer = styled.div<{ height: number }>`
  width: 100%;
  height: ${({ height }) => height}px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  font-family: ${({ theme }) => theme.typography.families.sansSerif};
  font-size: ${({ theme }) => theme.typography.sizes.s}px;
  color: ${({ theme }) => theme.colors.grayscale.dark2};
`;

export const StyledTableContainer = styled.div`
  width: 100%;
  flex: 0 0 auto;

  .ant-table-cell {
    font-variant-numeric: tabular-nums;
  }

  .ant-table-thead > tr > th {
    text-align: center;
    white-space: nowrap;
    font-size: ${({ theme }) => theme.typography.sizes.s}px;
  }

  .ant-table-tbody > tr > td {
    white-space: nowrap;
    }

  .ant-table-row-expand-icon-cell {
    padding: 0 !important;
    width: 0 !important;
    min-width: 0 !important;
    
  }
   .ant-table-tbody > tr > .ant-table-cell-fix-left{
      display: flex !important;
      align-items: center !important;
      flex-wrap: wrap !important;
    }
`;

export const StyledPositiveValue = styled.span`
  color: #389e0d;
`;

export const StyledNegativeValue = styled.span`
  color: #cf1322;
`;

export const StyledHighlight = styled.mark`
  background: ${({ theme }) => theme.colors.warning.light1};
  padding: 0;
  border-radius: 2px;
`;

export const StyledNameCell = styled.p<{ $clickable?: boolean }>`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 2px;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  user-select: text;

  &:hover {
    background: ${({ theme, $clickable }) =>
      $clickable ? theme.colors.grayscale.light3 : 'transparent'};
  }

  &.pvt-active {
    background: ${({ theme }) => theme.colors.primary.light4};
    color: ${({ theme }) => theme.colors.primary.dark1};
  }
`;
