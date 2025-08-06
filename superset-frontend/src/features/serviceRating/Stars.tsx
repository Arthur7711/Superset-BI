/* eslint-disable theme-colors/no-literal-colors */
import { styled } from '@superset-ui/core';
import { useState } from 'react';

interface IStarRatingProps {
  rating: number; // Rating should be between 0 and 5
  onChange: (newRating: number) => void;
}

const StarsContainer = styled.div`
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

export function Stars({ rating, onChange }: IStarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const displayRating = hovered ?? rating;
  return (
    <StarsContainer>
      {Array.from({ length: 10 }, (_, i) => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <span
          key={i}
          className={i < displayRating ? 'filled' : 'empty'}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(i + 1)}
        >
          ★
        </span>
      ))}
    </StarsContainer>
  );
}
