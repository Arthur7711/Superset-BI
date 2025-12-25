const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export const setCookie = (name: string, value: string, days?: number): void => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * ONE_DAY_MS);
    expires = `; expires=${date.toUTCString()}`;
  }
  // Add timestamp to the value
  const timestamp = new Date().getTime();
  const valueWithTimestamp = JSON.stringify({ value, timestamp });
  document.cookie = `${name}=${valueWithTimestamp}${expires}; path=/`;
};

export const getCookie = (
  name: string,
): { value: string; timestamp: number } | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      try {
        const cookieValue = JSON.parse(cookie.substring(nameEQ.length));
        return cookieValue;
      } catch {
        return null;
      }
    }
  }
  return null;
};
