/* eslint-disable theme-colors/no-literal-colors */

import { styled } from '@superset-ui/core';

export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 16px 0;
`;
export const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    cursor: pointer;
    font-size: 48px;
  }

  span:hover {
    color: orange;
  }

  .filled {
    color: orange;
    font-size: 56px;
  }

  .empty {
    color: lightgray;
    font-size: 56px;
  }
`;
