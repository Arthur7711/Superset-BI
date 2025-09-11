import { Fragment } from 'react';

interface HeaderProps {
  total: number;
  sum: number;
}

const headerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export const Header = (props: HeaderProps) => {
  const { total, sum } = props;
  const percent = (total / sum) * 100 - 100;
  const UIPercent = percent.toFixed(2);
  const colors = ['red', '#02FB02'];
  const isPositiveChange = percent >= 0;
  const spaceSymbol = '\u00A0';
  const UItotal = total.toFixed(1);
  return (
    <div style={headerStyles}>
      <h2 style={{ fontWeight: 500 }}>{UItotal}</h2>
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
          {sum}
        </span>
      </div>
    </div>
  );
};
