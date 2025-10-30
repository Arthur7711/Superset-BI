import { useState } from 'react';
// import { Input } from 'antd';
import { Link } from 'react-router-dom';
import { styled } from '@superset-ui/core';
import { ServiceModal } from './Modal';
import { Stars } from './Stars';
import { commentText, nextText, questions, submitText } from './constants';
// import { DetailsContainer } from './stylesContants';
// import { GetUserData } from './hooks/GetUserData';
// import { GetRatingInfo } from './hooks/GetRatingInfo';

// const { TextArea } = Input;

const StarsLink = styled.a`
  &:hover {
    text-decoration: none;
  }

  &:focus {
    text-decoration: none;
  }
`;
export function ServiceRating() {
  const [isOpen, setIsOpen] = useState(true);
  const onClose = () => setIsOpen(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [rating, setRating] = useState(0);
  // const [comment, setComment] = useState('');
  // const { user } = GetUserData();
  // const { data } = GetRatingInfo();
  // const nextQuestion = () => {
  //   if (activeQuestionIndex < questions.length - 1) {
  //     setActiveQuestionIndex(activeQuestionIndex + 1);
  //     setRating(0);
  //     setComment('');
  //   } else {
  //     onClose();
  //   }
  // };

  return (
    <ServiceModal
      isOpen={isOpen}
      onClose={onClose}
      // buttonTitle={
      //   activeQuestionIndex < questions.length - 1 ? nextText : submitText
      // }
      // onHandledPrimaryAction={nextQuestion}
    >
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
          Оцените пожалуйста наш сервис
        </h2>
        {/* <h3>{questions[activeQuestionIndex]}</h3> */}
        <StarsLink
          href="https://forms.gle/nr7Xu7gHdK3kiC7BA"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Stars rating={rating} onChange={setRating} />
        </StarsLink>
        {/* <div>
          <DetailsContainer>
            <p>{commentText}</p>
            <TextArea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Enter additional comments here..."
              autoSize={{ minRows: 4, maxRows: 10 }}
            />
          </DetailsContainer>
        </div> */}
      </div>
    </ServiceModal>
  );
}
