import { useEffect, useState } from 'react';

interface SupersetUser {
  username: string;
  userId: number;
  first_name: string;
  last_name: string;
  roles: string[];
  is_anonymous: boolean;
  email: string;
}

export const GetRatingInfo = () => {
  const [data, setData] = useState<SupersetUser | null>(null);

  useEffect(() => {
    fetch('https://api.example.com/data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setData(data.result));
  }, []);
  console.log('data is', data);
  return { data };
};
