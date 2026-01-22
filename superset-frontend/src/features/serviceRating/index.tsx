import { Input } from 'antd-v5';
import { getUrlParam } from 'src/utils/urlUtils';
import { URL_PARAMS } from 'src/constants';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';
import { useModalTimer } from './hooks/useModalTimer';
import { GetRatingInfo } from './hooks/GetRatingInfo';
import {
  ButtonContainer,
  CommentBLock,
  MainBlock,
  MultiContainer,
  QuestionContainer,
  RadioMultiGroup,
  SaveButton,
  Title,
} from './stylesContants';
import { submitText } from './constants';

const { TextArea } = Input;

export function ServiceRating() {
  const {
    data,
    isModalVisible,
    closeModal,
    comment,
    setComment,
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

  const standalone = getUrlParam(URL_PARAMS.standalone);
  if (standalone) return <></>;

  return (
    <ServiceModal isOpen={isModalVisible && isVisible} onClose={onClose}>
      <MainBlock>
        <Title>Оцените качество сервиса</Title>
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
                  rating={Number(getRating(item.id))}
                  onChange={rating => onRating(item.id, rating)}
                />
              )}
              {item.is_multichoice && (
                <div>
                  <MultiContainer>
                    <RadioMultiGroup
                      options={item?.answers_to_choice.map(el => ({
                        value: el,
                        label: `${el}`,
                        id: el,
                      }))}
                      value={getRating(item.id)}
                      onChange={el => onRating(item.id, el.target.value)}
                    />
                  </MultiContainer>
                  <CommentBLock>
                    {getRating(item.id) === 'Другое' && (
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
