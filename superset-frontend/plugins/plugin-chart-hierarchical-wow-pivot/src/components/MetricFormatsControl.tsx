import React, { useCallback } from 'react';
import { Checkbox, Select } from 'antd';
import { Currency, styled, t, getCurrencySymbol } from '@superset-ui/core';
import { D3_FORMAT_OPTIONS } from '@superset-ui/chart-controls';

const { Option } = Select;

export interface MetricFormatEntry {
  valueFormat?: string;
  currency_format?: Partial<Currency>;
  revertDelta?: boolean;
}

export type MetricFormatsValue = Record<string, MetricFormatEntry>;

interface MetricFormatsControlProps {
  value?: MetricFormatsValue;
  onChange: (value: MetricFormatsValue) => void;
  metricLabels?: string[];
}

const POSITION_OPTIONS = [
  { value: 'prefix', label: t('Prefix') },
  { value: 'suffix', label: t('Suffix') },
];

const COMMON_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'INR', 'RUB',
  'BRL', 'CAD', 'AUD', 'CHF', 'HKD', 'SGD', 'SEK', 'NOK',
  'MXN', 'ZAR', 'TRY', 'PLN', 'THB', 'IDR', 'CZK', 'ILS',
  'PHP', 'TWD', 'PKR', 'NZD', 'KZT', 'UAH', 'AED', 'SAR',
];

const currencyOptions = COMMON_CURRENCIES.map(code => {
  let label = code;
  try {
    label = `${getCurrencySymbol({ symbol: code })} (${code})`;
  } catch {
    label = code;
  }
  return { value: code, label };
});

const formatOptions = D3_FORMAT_OPTIONS.map(([value, label]) => ({
  value,
  label: String(label),
}));

const MetricBlock = styled.div`
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grayscale.light2};
  border-radius: 4px;
  overflow: hidden;
`;

const MetricTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.grayscale.dark1};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
  min-width: 0;
`;

const Label = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  min-width: 70px;
  flex-shrink: 0;
`;

const LabelFormatter = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.grayscale.base};
  min-width: 70px;
  flex-shrink: 0;
`;

export default function MetricFormatsControl({
  value = {},
  onChange,
  metricLabels = [],
}: MetricFormatsControlProps) {
  const updateMetric = useCallback(
    (metricKey: string, patch: Partial<MetricFormatEntry>) => {
      const prev = value[metricKey] ?? {};
      onChange({
        ...value,
        [metricKey]: { ...prev, ...patch },
      });
    },
    [value, onChange],
  );

  const updateCurrency = useCallback(
    (metricKey: string, patch: Partial<Currency>) => {
      const prev = value[metricKey] ?? {};
      const prevCurrency = prev.currency_format ?? {};
      onChange({
        ...value,
        [metricKey]: {
          ...prev,
          currency_format: { ...prevCurrency, ...patch },
        },
      });
    },
    [value, onChange],
  );

  const clearCurrencyField = useCallback(
    (metricKey: string, field: keyof Currency) => {
      const prev = value[metricKey] ?? {};
      const prevCurrency = { ...(prev.currency_format ?? {}) };
      delete prevCurrency[field];
      onChange({
        ...value,
        [metricKey]: { ...prev, currency_format: prevCurrency },
      });
    },
    [value, onChange],
  );

  if (!metricLabels.length) {
    return <span>{t('No metrics selected')}</span>;
  }

  return (
    <div>
      {metricLabels.map(metricKey => {
        const entry = value[metricKey] ?? {};
        return (
          <MetricBlock key={metricKey}>
            <MetricTitle title={metricKey}>{metricKey}</MetricTitle>
            <Row>
              <LabelFormatter>{t('Number format')}</LabelFormatter>
              <Select
                style={{ flex: 1, minWidth: 0 }}
                size="small"
                placeholder={t('Default')}
                allowClear
                showSearch
                value={entry.valueFormat ?? undefined}
                onChange={(val: string) =>
                  updateMetric(metricKey, { valueFormat: val })
                }
                onClear={() =>
                  updateMetric(metricKey, { valueFormat: undefined })
                }
              >
                {formatOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Row>
            <Row>
              <Label>{t('Currency')}</Label>
              <Select
                style={{ flex: 1, minWidth: 0 }}
                size="small"
                placeholder={t('Prefix or suffix')}
                allowClear
                value={entry.currency_format?.symbolPosition ?? undefined}
                onChange={(val: string) =>
                  updateCurrency(metricKey, {
                    symbolPosition: val as Currency['symbolPosition'],
                  })
                }
                onClear={() =>
                  clearCurrencyField(metricKey, 'symbolPosition')
                }
              >
                {POSITION_OPTIONS.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
              <Select
                style={{ flex: 1, minWidth: 0 }}
                size="small"
                placeholder={t('Currency')}
                allowClear
                showSearch
                value={entry.currency_format?.symbol ?? undefined}
                onChange={(val: string) =>
                  updateCurrency(metricKey, { symbol: val })
                }
                onClear={() => clearCurrencyField(metricKey, 'symbol')}
              >
                {currencyOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Row>
            <Row>
              <Checkbox
                checked={!!entry.revertDelta}
                onChange={e =>
                  updateMetric(metricKey, { revertDelta: e.target.checked })
                }
              >
                {t('Revert deviations')}
              </Checkbox>
            </Row>
          </MetricBlock>
        );
      })}
    </div>
  );
}
