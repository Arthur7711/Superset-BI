export const TriangleComponent = ({
  direction,
}: {
  direction: 'up' | 'down' | 'none';
}) => (
  <span
    style={{
      color:
        direction === 'up'
          ? '#02FB02'
          : direction === 'down'
            ? 'red'
            : 'inherit',
      fontSize: '12px',
      rotate: direction === 'down' ? '180deg' : '0deg',
      display: direction === 'none' ? 'none' : 'inline-block',
    }}
  >
    ▲
  </span>
);
