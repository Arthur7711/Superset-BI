import { useEffect, useState } from 'react';
import { Watermark, SmallWatermark } from './UIWatermark';

interface SupersetUser {
  username: string;
  userId: number;
  first_name: string;
  last_name: string;
  roles: string[];
  is_anonymous: boolean;
  email: string;
}

export const UserDataWatermark = ({
  styles,
}: {
  styles?: React.CSSProperties;
}) => {
  const [user, setUser] = useState<SupersetUser | null>(null);

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
      .then(data => setUser(data.result));
  }, []);
  return (
    <>
      <Watermark style={styles}>{user?.email}</Watermark>
      <SmallWatermark leftOrigin="10%" topOrigin="5%">
        {user?.email}
      </SmallWatermark>
      <SmallWatermark rightOrigin="10%" topOrigin="5%">
        {user?.email}
      </SmallWatermark>
    </>
  );
};
