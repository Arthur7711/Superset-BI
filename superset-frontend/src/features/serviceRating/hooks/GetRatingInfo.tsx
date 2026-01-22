import { useEffect, useState } from 'react';
import {
  getQuestions,
  postAnswer,
  postAnswers,
} from '../services/questionsServices';
import { GetUserData } from './GetUserData';
import { questions } from '../mockData';

interface IData {
  id: number;
  text: string;
  answers_to_choice: string[];
  is_multichoice: boolean;
}
const other = 'Другое';
export const GetRatingInfo = () => {
  const [data, setData] = useState<IData[] | null>(null);
  const [activeItem, setActiveItem] = useState<IData | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saveData, setSaveData] = useState<
    {
      answers: string[];
      id: number;
    }[]
  >([]);
  const [isDisabled, setDisabled] = useState(true);
  const { user } = GetUserData();

  const rateItems = () => {
    if (saveData && user?.email && !isDisabled) {
      const requestData = saveData.map(item => {
        if (item.answers[0] === other) {
          return {
            ...item,
            answers: [comment],
          };
        }
        return item;
      });

      postAnswers(user.email, requestData).then(() => {
        setData(null);
        setIsModalVisible(false);
        setSaveData([]);
        setComment('');
      });
    }
  };

  const rateItem = () => {
    if (
      activeItem &&
      data &&
      user?.email &&
      (rating || activeItem.is_multichoice)
    ) {
      const currentIndex = data.findIndex(el => el.id === activeItem.id) || 0;
      const nexIndex = currentIndex + 1;
      const nextElement = data[nexIndex];
      setRating(0);
      if (nextElement) {
        setActiveItemIndex(nexIndex);
        setActiveItem(nextElement);
      } else {
        setActiveItem(null);
        setData(null);
        setIsModalVisible(false);
      }
    }
  };
  const closeModal = () => {
    setIsModalVisible(false);
  };
  const onRating = (id: number | string, rating: number) => {
    const item = saveData.find(el => el.id === id);
    const otherItems = saveData.filter(el => el.id !== id);
    if (item) {
      item.answers = [`${rating}`];
      setSaveData([...otherItems, item]);
    }
  };
  const getRating = (id: number | string) => {
    const selectedItem = saveData.find(el => el.id === id);
    return selectedItem?.answers[0];
  };

  useEffect(() => {
    if (user?.email) {
      (async () => {
        // const data = await getQuestions(user.email);
        const data = questions;
        console.log('data', data);
        if (data?.length) {
          const innerData = data.map(el => ({ id: el.id, answers: [] }));
          setSaveData(innerData);
          setIsModalVisible(true);
          setData(data);
          setActiveItem(data?.[0]);
        }
      })();
    }
  }, [user?.email]);

  useEffect(() => {
    if (data) {
      const multiChoiceItem = data.find(el => el.is_multichoice);
      if (multiChoiceItem) {
        const item = saveData.find(el => el.id === multiChoiceItem.id);
        const otherItems = saveData.filter(el => el.id !== multiChoiceItem.id);
        if (item) {
          setSaveData([...otherItems, item]);
        }
      }
    }
  }, [data, comment]);

  useEffect(() => {
    const isEmptyItem = saveData.find(el => !el.answers.length);
    setDisabled(!!isEmptyItem);
  }, [saveData]);

  return {
    data,
    rateItem,
    activeItem,
    rating,
    setRating,
    activeItemIndex,
    isModalVisible,
    closeModal,
    comment,
    setComment,
    saveData,
    onRating,
    getRating,
    rateItems,
    isDisabled,
    userId: user?.email || '',
  };
};
