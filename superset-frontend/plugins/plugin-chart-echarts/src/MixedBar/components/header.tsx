import { Fragment } from 'react';

interface HeaderProps {
  total: number;
  prevTotal: number;
}

const headerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export const Header = (props: HeaderProps) => {
  const { total, prevTotal } = props;
  const percent = (total / prevTotal) * 100 - 100;
  const colors = ['red', '#02FB02'];
  const isPositiveChange = percent >= 0;
  const spaceSymbol = '\u00A0';
  return (
    <div style={headerStyles}>
      <h2 style={{ fontWeight: 500 }}>{total}</h2>
      <div>
        <span>WoW: </span>
        {isPositiveChange ? (
          <span style={{ color: colors[1] }}>▲ </span>
        ) : (
          <span style={{ color: colors[0] }}>▼ </span>
        )}
        <span>{percent}% </span>
        <span>
          {[...Array(4)].map((_, index) => (
            <Fragment key={index}>{spaceSymbol}</Fragment>
          ))}
          {prevTotal}
        </span>
      </div>
    </div>
  );
};
