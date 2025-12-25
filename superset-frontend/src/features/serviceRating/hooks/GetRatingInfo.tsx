import { useEffect, useState } from 'react';
import { getQuestions, postAnswer } from '../services/questionsServices';
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
  const [multiChoice, setMultiChoice] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const { user } = GetUserData();

  const rateItem = () => {
    if (
      activeItem &&
      data &&
      user?.email &&
      (rating || (activeItem.is_multichoice && multiChoice.length))
    ) {
      const currentIndex = data.findIndex(el => el.id === activeItem.id) || 0;
      const nexIndex = currentIndex + 1;
      const multiChoiceData = comment
        ? [...multiChoice.filter(el => el !== other), comment]
        : multiChoice;
      postAnswer(
        user.email,
        activeItem.id,
        activeItem.is_multichoice ? multiChoiceData : [`${rating}`],
      ).then(d => {
        const nextElement = data[nexIndex];
        setRating(0);
        if (nextElement) {
          setActiveItemIndex(nexIndex);
          setActiveItem(nextElement);
        } else {
          setActiveItem(null);
          setData(null);
          setIsModalVisible(false);
          setMultiChoice([]);
        }
      });
    }
  };
  const onCheck = (item: string) => {
    if (multiChoice.includes(item)) {
      setMultiChoice(multiChoice.filter(el => el !== item));
    } else {
      setMultiChoice([...multiChoice, item]);
    }
  };
  const closeModal = () => {
    setIsModalVisible(false);
  };
  useEffect(() => {
    if (user?.email) {
      (async () => {
        // const data = await getQuestions(user.email);
        const data = questions;
        if (data?.length) {
          setIsModalVisible(true);
          setData(data);
          setActiveItem(data?.[0]);
        }
      })();
    }
  }, [user?.email]);
  useEffect(() => {
    if (multiChoice.includes(other)) {
      setShowComment(true);
    } else {
      setShowComment(false);
      setComment('');
    }
  }, [activeItem, multiChoice]);

  return {
    data,
    onCheck,
    rateItem,
    activeItem,
    multiChoice,
    rating,
    setRating,
    activeItemIndex,
    isModalVisible,
    closeModal,
    showComment,
    comment,
    setComment,
  };
};
