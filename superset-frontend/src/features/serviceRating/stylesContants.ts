/* eslint-disable theme-colors/no-literal-colors */

import { styled } from '@superset-ui/core';

export const MainBlock = styled.div`
  max-height: 60vh;
`;
export const Title = styled.h2`
  text-align: center;
  margin-bottom: 32px;
`;
export const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 16px 0;
`;
export const SaveButton = styled.button`
  background-color: rgba(255, 165, 0, 0.7);
  color: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 4px;
  font-weight: 600;
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

export const SelectsLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;

  & input[type='checkbox'] {
    accent-color: orange;
  }
`;

export const CommentBLock = styled.div`
  margin-top: 8px;
`;

export const QuestionContainer = styled.div`
  margin: 50px 0;
  border-bottom: 2px dashed gray;
  padding-bottom: 8px;
`;
