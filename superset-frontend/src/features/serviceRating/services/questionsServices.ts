import { usersMails } from '../constants';

export const getQuestions = async (id: string) => {
  console.log('id', id);
  if (!usersMails.includes(id)) {
    return [];
  }
  const req = await fetch(
    `https://bi-survey.dev.cluster.daymarket.uz/questions/${id}`,
  );
  const data = await req.json();
  return data.questions;
};

export const postAnswer = async (
  id: string,
  questionId: number,
  answers: string[],
) => {
  const req = await fetch(
    `https://bi-survey.dev.cluster.daymarket.uz/answer/${id}/${questionId}`,
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
  const req = await fetch(
    `https://bi-survey.dev.cluster.daymarket.uz/answer/${id}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // issues with body type
      body: JSON.stringify(answers),
    },
  );
  const data = await req.json();
  return data.questions;
};
