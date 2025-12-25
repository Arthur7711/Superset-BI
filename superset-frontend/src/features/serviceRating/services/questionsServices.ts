export const getQuestions = async (id: string) => {
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
