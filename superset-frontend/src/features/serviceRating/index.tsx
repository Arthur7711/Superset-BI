import { useState } from 'react';
import { Button, Input } from 'antd';
import { styled } from '@superset-ui/core';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: 16px 0;
`;
const DetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const questions = [
  'Overall satisfaction with Superset?',
  'Data quality?',
  'Platform stability/performance?',
];
const commentText = 'Please provide any additional comments or feedback:';
const submitText = 'Submit';
const nextText = 'Next';

export function ServiceRating() {
  const [isOpen, setIsOpen] = useState(true);
  const onClose = () => setIsOpen(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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
    <ServiceModal isOpen={isOpen} onClose={onClose}>
      <div>
        <h2>{questions[activeQuestionIndex]}</h2>
        <Stars rating={rating} onChange={setRating} />
        <div>
          <DetailsContainer>
            <h4>{commentText}</h4>
            <Input value={comment} onChange={e => setComment(e.target.value)} />
          </DetailsContainer>
          <ButtonContainer>
            <Button type="primary" onClick={nextQuestion}>
              {activeQuestionIndex < questions.length - 1
                ? nextText
                : submitText}
            </Button>
          </ButtonContainer>
        </div>
      </div>
    </ServiceModal>
  );
}
