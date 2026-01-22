/* eslint-disable theme-colors/no-literal-colors */

import { styled } from '@superset-ui/core';
import { Radio } from 'antd-v5';

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
  padding: 16px 0;
`;
export const SaveButton = styled.button`
  background-color: #20a7c9;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  color: #ffffff;

  &:disabled {
    background: #d6d2d2;
  }
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
  height: 40px;

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

export const RadioGroup = styled(Radio.Group)`
  label {
    flex-direction: column;
  }
`;
export const RadioContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SelectsLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;

  & input[type='checkbox'] {
    accent-color: #20a7c9;
  }
`;

export const CommentBLock = styled.div`
  margin-top: 8px;
`;

export const QuestionContainer = styled.div`
  margin: 22px 0 0 0;
  border-bottom: 2px dashed gray;
  // padding-bottom: 22px;
`;

export const RadioMultiGroup = styled(Radio.Group)`
  label {
    flex-direction: row;
    display: flex;
  }
`;
export const MultiContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;
