import { usersList } from '../constants';

export const checkUserShowDate = (email: string) => {
  const user = usersList.find(user => user.email === email);
  return user ? new Date(user.date) <= new Date() : false;
};
