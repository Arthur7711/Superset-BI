import { Input } from 'antd';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';
import { useModalTimer } from './hooks/useModalTimer';
import { GetRatingInfo } from './hooks/GetRatingInfo';
import {
  ButtonContainer,
  CommentBLock,
  MainBlock,
  QuestionContainer,
  SaveButton,
  SelectsLabel,
  Title,
} from './stylesContants';
import { submitText } from './constants';

const { TextArea } = Input;

export function ServiceRating() {
  // const { connectToCookies, isModalVisible } = useModalTimer();
  const {
    data,
    onCheck,
    // rateItem,
    // activeItem,
    multiChoice,
    // rating,
    // setRating,
    // activeItemIndex,
    isModalVisible,
    closeModal,
    comment,
    setComment,
    showComment,
    // saveData,
    onRating,
    getRating,
    rateItems,
  } = GetRatingInfo();
  const onClose = () => {
    closeModal();
    // connectToCookies();
  };

  return (
    <ServiceModal isOpen={isModalVisible} onClose={onClose}>
      <MainBlock>
        <Title>Оцените пожалуйста наш сервис</Title>
        {data &&
          !!data.length &&
          data?.map(item => (
            <QuestionContainer key={item.id}>
              <h4>{item.text}</h4>
              {!item.is_multichoice && (
                <Stars
                  rating={getRating(item.id)}
                  onChange={rating => onRating(item.id, rating)}
                />
              )}
              {item.is_multichoice && (
                <div>
                  {item?.answers_to_choice.map(el => (
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
              )}
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
          <SaveButton onClick={rateItems} type="button">
            {submitText}
          </SaveButton>
        </ButtonContainer>
      </MainBlock>
    </ServiceModal>
  );
}
