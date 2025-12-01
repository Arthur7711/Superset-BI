export const getFormattedDate = (time: number) => {
  const date = new Date(time);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  const formatted = `${year}-${month}-${day}`;

  return formatted;
};
