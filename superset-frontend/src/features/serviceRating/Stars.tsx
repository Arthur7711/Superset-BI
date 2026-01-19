import { useState } from 'react';
import { RadioChangeEvent } from 'antd-v5';
import { RadioContainer, RadioGroup } from './stylesContants';

interface IStarRatingProps {
  rating: number; // Rating should be between 0 and 10
  onChange: (newRating: number) => void;
}

export function Stars({ rating, onChange }: IStarRatingProps) {
  // const [hovered, setHovered] = useState<number | null>(null);
  // const displayRating = hovered ?? rating - 1;
  const [value, setValue] = useState(rating);

  const onChangeValue = (e: RadioChangeEvent) => {
    onChange(e.target.value);
    setValue(e.target.value);
  };
  return (
    <RadioContainer>
      <RadioGroup
        options={Array.from({ length: 11 }, (_, i) => ({
          value: i,
          label: `${i}`,
        }))}
        value={value}
        onChange={onChangeValue}
      />
    </RadioContainer>

    // <RadioContainer>
    //   {Array.from({ length: 10 }, (_, i) => (
    //     // eslint-disable-next-line jsx-a11y/no-static-element-interactions

    //     <RadioButton key={i} type="radio" name="option" checked />
    //     // <RadioButtonContainer
    //     //   key={i}
    //     //   onClick={() => onChange(i + 1)}
    //     //   onMouseEnter={() => setHovered(i)}
    //     //   onMouseLeave={() => setHovered(null)}
    //     //   className={i === displayRating ? 'filled' : 'empty'}
    //     // >
    //     //   <input type="radio" name="option" checked />
    //     //   <RadioCustom />
    //     //   {i + 1}
    //     // </RadioButtonContainer>
    //     // <span
    //     //   key={i}
    //     //   className={i < displayRating ? 'filled' : 'empty'}
    //     //   onMouseEnter={() => setHovered(i)}
    //     //   onMouseLeave={() => setHovered(null)}
    //     //   onClick={() => onChange(i + 1)}
    //     // >
    //     //   ★
    //     // </span>
    //   ))}
    // </RadioContainer>
  );
}
