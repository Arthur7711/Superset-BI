import { useState } from 'react';
import { StarsContainer } from './stylesContants';

interface IStarRatingProps {
  rating: number; // Rating should be between 0 and 10
  onChange: (newRating: number) => void;
}

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
