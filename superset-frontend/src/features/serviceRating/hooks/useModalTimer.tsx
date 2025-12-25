import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setCookie, getCookie } from '../utils/cookiesController';

const COOKIE_KEY = 'modal_last_shown';

export function useModalTimer() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const location = useLocation();

  const connectToCookies = () => {
    setCookie(COOKIE_KEY, 'shown', 1);
    setIsModalVisible(false);
  };
  useEffect(() => {
    const cookie = getCookie(COOKIE_KEY);
    if (!cookie) {
      setIsModalVisible(true);
    }
  }, [location.pathname]);
  return { isModalVisible, connectToCookies };
}
