const getDateString = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const dateObj = new Date(date);
  const dateString = dateObj.toLocaleDateString('ru-RU', options);

  // срезаем " г." с конца строки
  return dateString.slice(0, -3);
};

export default getDateString;
