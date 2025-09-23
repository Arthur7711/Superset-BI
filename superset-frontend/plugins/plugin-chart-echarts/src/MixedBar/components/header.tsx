import { getCurrencySymbol, getNumberFormatter } from '@superset-ui/core';
import { Fragment } from 'react';

interface HeaderProps {
  total: number;
  sum: number;
  yoySum: number;
  currencyFormat?: {
    symbol: string;
    symbolPosition: 'prefix' | 'suffix';
  };
}

const headerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const sumContainerStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '40px 20px 60px 1fr',
  gap: '2px',
  width: '200px',
};

export const Header = (props: HeaderProps) => {
  const { total, sum, yoySum, currencyFormat } = props;
  const formatter = getNumberFormatter();
  const percent = (total / sum) * 100 - 100;
  const yoyPercent = (yoySum / sum) * 100 - 100;
  const UIPercent = percent.toFixed(1);
  const UIYoYPercent = yoyPercent.toFixed(1);
  const colors = ['red', '#02FB02'];
  const isPositiveChange = percent >= 0;
  const isPositiveYoY = yoyPercent >= 0;
  const spaceSymbol = '\u00A0';
  const UItotal = formatter(total);
  const UISum = formatter(sum);
  const currencySymbol = currencyFormat?.symbol
    ? getCurrencySymbol(currencyFormat)
    : '';
  const currencyPosition = currencyFormat?.symbolPosition || 'suffix';

  return (
    <div style={headerStyles}>
      <h2
        style={{
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexDirection: currencyPosition === 'prefix' ? 'row-reverse' : 'row',
        }}
      >
        <span>{UItotal}</span>
        <span>{currencySymbol}</span>
      </h2>
      {yoySum ? (
        <div style={sumContainerStyles}>
          <span>YoY: </span>
          {isPositiveYoY ? (
            <span style={{ color: colors[1] }}>▲ </span>
          ) : (
            <span style={{ color: colors[0] }}>▼ </span>
          )}
          <span>{UIYoYPercent}%</span>
        </div>
      ) : null}
      <div style={sumContainerStyles}>
        <span>WoW: </span>
        {isPositiveChange ? (
          <span style={{ color: colors[1] }}>▲ </span>
        ) : (
          <span style={{ color: colors[0] }}>▼ </span>
        )}
        <span>{UIPercent}% </span>
        <span>
          {[...Array(4)].map((_, index) => (
            <Fragment key={index}>{spaceSymbol}</Fragment>
          ))}
          {UISum}
        </span>
      </div>
    </div>
  );
};
