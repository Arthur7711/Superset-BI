import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setCookie, getCookie } from '../utils/cookiesController';

const COOKIE_KEY = 'modal_last_shown';

export function useModalTimer(userId: string) {
  const [isVisible, setModalVisible] = useState(false);
  const location = useLocation();

  const connectToCookies = () => {
    setCookie(`${COOKIE_KEY}_${userId}`, 'shown', 0.5);
    setModalVisible(false);
  };
  useEffect(() => {
    if (userId) {
      const cookie = getCookie(`${COOKIE_KEY}_${userId}`);
      if (!cookie) {
        setModalVisible(true);
      }
    }
  }, [location.pathname, userId]);
  return { isVisible, connectToCookies };
}
