import { getCurrencySymbol, getNumberFormatter } from '@superset-ui/core';
import { Fragment } from 'react';

interface HeaderProps {
  total: number;
  sum: number;
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

export const Header = (props: HeaderProps) => {
  const { total, sum, currencyFormat } = props;
  const formatter = getNumberFormatter();
  const percent = (total / sum) * 100 - 100;
  const UIPercent = percent.toFixed(1);
  const colors = ['red', '#02FB02'];
  const isPositiveChange = percent >= 0;
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
      <div>
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
