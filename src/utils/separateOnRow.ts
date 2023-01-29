const separateOnRow = <T>(array: T[], count: number): T[][] => {
  const newArray: T[][] = [[]];
  let length = 0;
  let lastIndex: number = newArray.length - 1;
  array.forEach((item) => {
    if (length === count) {
      lastIndex += 1;
      length = 0;
      newArray.push([]);
    }
    newArray[lastIndex].push(item);
    length += 1;
  });

  return newArray;
};

export default separateOnRow;
