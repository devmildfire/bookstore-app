const getRandomBetween = (start: number, end: number): number => {
  return Math.floor(Math.random() * end) + start;
};

export default getRandomBetween;
