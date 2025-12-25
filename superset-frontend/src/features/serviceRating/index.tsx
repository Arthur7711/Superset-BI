import { Input } from 'antd';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';
import { useModalTimer } from './hooks/useModalTimer';
import { GetRatingInfo } from './hooks/GetRatingInfo';
import {
  ButtonContainer,
  CommentBLock,
  QuestionContainer,
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
      <div style={{ maxHeight: '60vh' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
          Оцените пожалуйста наш сервис
        </h2>
        {data?.map(item => (
          <QuestionContainer key={item.id}>
            <h4>{item?.text}</h4>
            {!item?.is_multichoice && (
              <Stars rating={rating} onChange={setRating} />
            )}
            <div>
              {item?.is_multichoice &&
                item.answers_to_choice.map(el => (
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
          </QuestionContainer>
        ))}
        {/* <h4>{activeItem?.text}</h4>
        {!activeItem?.is_multichoice && (
          <Stars rating={rating} onChange={setRating} />
        )} */}
        {/* <div>
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
        </div> */}
        <ButtonContainer>
          <SaveButton onClick={rateItem} type="button">
            {data && activeItemIndex < data?.length - 1 ? nextText : submitText}
          </SaveButton>
        </ButtonContainer>
      </div>
    </ServiceModal>
  );
}
