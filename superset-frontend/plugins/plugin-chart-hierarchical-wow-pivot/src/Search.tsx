import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { t,styled } from '@superset-ui/core';

const StyledInput = styled(Input)`
  width: 200px;
  border: 2px solid rgb(187,187,187);
  border-radius: 5px;
`;

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Search({ value, onChange }: SearchProps) {
  return (
    <StyledInput
      size="small"
      allowClear
      prefix={<SearchOutlined />}
      placeholder={t('Search categories...')}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}
