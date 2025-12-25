import { Input } from 'antd';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';
import { useModalTimer } from './hooks/useModalTimer';
import { GetRatingInfo } from './hooks/GetRatingInfo';
import {
  ButtonContainer,
  CommentBLock,
  SaveButton,
  SelectsLabel,
} from './stylesContants';
import { nextText, submitText } from './constants';

const { TextArea } = Input;

export function ServiceRating() {
  // const { connectToCookies, isModalVisible } = useModalTimer();
  const {
    data,
    onCheck,
    rateItem,
    activeItem,
    multiChoice,
    rating,
    setRating,
    activeItemIndex,
    isModalVisible,
    closeModal,
    comment,
    setComment,
    showComment,
  } = GetRatingInfo();
  const onClose = () => {
    closeModal();
    // connectToCookies();
  };

  return (
    <ServiceModal isOpen={isModalVisible} onClose={onClose}>
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
          Оцените пожалуйста наш сервис
        </h2>
        <h4>{activeItem?.text}</h4>
        {!activeItem?.is_multichoice && (
          <Stars rating={rating} onChange={setRating} />
        )}
        <div>
          {activeItem?.is_multichoice &&
            activeItem.answers_to_choice.map(el => (
              <div key={el}>
                <SelectsLabel>
                  <input
                    type="checkbox"
                    checked={multiChoice.includes(el)}
                    onChange={() => onCheck(el)}
                  />
                  <span>{el}</span>
                </SelectsLabel>
              </div>
            ))}
          <CommentBLock>
            {showComment && (
              <TextArea
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
            )}
          </CommentBLock>
        </div>
        <ButtonContainer>
          <SaveButton onClick={rateItem} type="button">
            {data && activeItemIndex < data?.length - 1 ? nextText : submitText}
          </SaveButton>
        </ButtonContainer>
      </div>
    </ServiceModal>
  );
}
