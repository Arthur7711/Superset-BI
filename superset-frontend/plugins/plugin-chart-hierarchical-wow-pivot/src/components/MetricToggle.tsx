import React from 'react';
import { styled } from '@superset-ui/core';
import { Checkbox, Space } from 'antd';
import { MetricConfig } from '../types';

interface MetricToggleProps {
  metrics: MetricConfig[];
  enabledKeys: Set<string>;
  onToggle: (key: string) => void;
}
const StyledCheckbox = styled(Checkbox)`
  border: 1px solid rgb(236,237,240);
  border-radius: 5px;
  background-color: rgb(246,247,249);
  padding: 4px 8px;
`;
export default function MetricToggle({
  metrics,
  enabledKeys,
  onToggle,
}: MetricToggleProps) {
  return (
    <Space size={4} wrap>
      {metrics.map(m => (
        <StyledCheckbox
          key={m.key}
          checked={enabledKeys.has(m.key)}
          onChange={() => onToggle(m.key)}
        >
          {m.label}
        </StyledCheckbox>
      ))}
    </Space>
  );
}
