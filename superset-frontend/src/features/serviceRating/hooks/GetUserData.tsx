import { useEffect, useState } from 'react';

interface SupersetUser {
  username: string;
  userId: number;
  first_name: string;
  last_name: string;
  roles: string[];
  is_anonymous: boolean;
}

export const GetUserData = () => {
  const [user, setUser] = useState<SupersetUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/me/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setUser(data.result))
      .catch(err => setError(err.message));
  }, []);
  console.log('user', user);
  return { user, error };
};
