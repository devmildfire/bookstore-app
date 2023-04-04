/**
 *
 * @param array массив который нужно разбить на двумерный
 * @param columnLength длина вложенных массивов
 * @returns двумерный массив
 */
const splitByRows = <T>(array: T[], columnLength: number): T[][] => {
  let row = 0;
  const reducer = (grid: T[][], curr: T) => {
    if (grid[row].length === columnLength) {
      row += 1;
      grid.push([]);
    }
    grid[row].push(curr);
    return grid;
  };

  return array.reduce(reducer, [[]]);
};

export default splitByRows;
