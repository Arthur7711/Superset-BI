import { checkUserShowDate } from '../utils/checkUserShowDate';

export const getQuestions = async (id: string) => {
  console.log('id', id);
  if (!checkUserShowDate(id)) {
    return [];
  }
  const req = await fetch(`${process.env.SERVICE_API}/questions/${id}`);
  const data = await req.json();
  return data.questions;
};

export const postAnswer = async (
  id: string,
  questionId: number,
  answers: string[],
) => {
  const req = await fetch(
    `${process.env.SERVICE_API}/answer/${id}/${questionId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // issues with body type
      body: JSON.stringify({ answer: answers }),
    },
  );
  const data = await req.json();
  return data.questions;
};

export const postAnswers = async (
  id: string,
  answers: { id: number; answers: string[] }[],
) => {
  const req = await fetch(`${process.env.SERVICE_API}/answer/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // issues with body type
    body: JSON.stringify(answers),
  });
  const data = await req.json();
  return data.questions;
};
