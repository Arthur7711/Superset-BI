import { useState } from 'react';
import { Input } from 'antd';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';
import { commentText, nextText, questions, submitText } from './constants';
import { DetailsContainer } from './stylesContants';
import { GetUserData } from './hooks/GetUserData';
import { GetRatingInfo } from './hooks/GetRatingInfo';

const { TextArea } = Input;

export function ServiceRating() {
  const [isOpen, setIsOpen] = useState(true);
  const onClose = () => setIsOpen(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = GetUserData();
  const { data } = GetRatingInfo();
  const nextQuestion = () => {
    if (activeQuestionIndex < questions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      setRating(0);
      setComment('');
    } else {
      onClose();
    }
  };

  return (
    <ServiceModal
      isOpen={isOpen}
      onClose={onClose}
      buttonTitle={
        activeQuestionIndex < questions.length - 1 ? nextText : submitText
      }
      onHandledPrimaryAction={nextQuestion}
    >
      <div>
        <h3>{questions[activeQuestionIndex]}</h3>
        <Stars rating={rating} onChange={setRating} />
        <div>
          <DetailsContainer>
            <p>{commentText}</p>
            <TextArea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Enter additional comments here..."
              autoSize={{ minRows: 4, maxRows: 10 }}
            />
          </DetailsContainer>
        </div>
      </div>
    </ServiceModal>
  );
}
