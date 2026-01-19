import { Input, Checkbox } from 'antd-v5';
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
  const {
    data,
    onCheck,
    multiChoice,
    isModalVisible,
    closeModal,
    comment,
    setComment,
    showComment,
    onRating,
    getRating,
    rateItems,
    isDisabled,
    userId,
  } = GetRatingInfo();
  const { connectToCookies, isVisible } = useModalTimer(userId);
  const onClose = () => {
    closeModal();
    connectToCookies();
  };
  return (
    <ServiceModal isOpen={isModalVisible && isVisible} onClose={onClose}>
      <MainBlock>
        <Title>Оцените пожалуйста наш сервис</Title>
        {data &&
          !!data.length &&
          data?.map(item => (
            <QuestionContainer key={item.id}>
              <h4>{item.text}</h4>
              {!item.is_multichoice && (
                <ul>
                  <li>{item.answers_to_choice[0]}</li>
                  <li>
                    {item.answers_to_choice[item.answers_to_choice.length - 1]}
                  </li>
                </ul>
              )}
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
                        <Checkbox
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
        <ButtonContainer>
          <SaveButton onClick={rateItems} type="button" disabled={isDisabled}>
            {submitText}
          </SaveButton>
        </ButtonContainer>
      </MainBlock>
    </ServiceModal>
  );
}
