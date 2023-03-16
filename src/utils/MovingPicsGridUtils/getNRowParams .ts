/**
 *
 * @param maxPicHeight максимальная высота картинки в ряду
 * @param minPicHeight минимальная высота картинки в ряду
 * @param width ширина контейнера для рядов картинок
 * @param height высота контейнера для рядов картинок
 * @returns число рядов (nRows), высоту картинки (picHeight) в рядоу и
 * количество картинок для ряда (nPicsPerRow), необходимое для
 * того чтобы полностью замостить компонент контейнер с высотой height и
 * шириной width, а также общее число необходимых картинок (picsNumber).
 * Эти данные впоследствие используются для расчёта
 * компонента MovingPicsGrid
 */
const getNRowParams = (
  maxPicHeight: number,
  minPicHeight: number,
  width: number,
  height: number
): number[] => {
  //  максимальное и минимальное число рядов для заданного диапазона высоты картинок
  const maxRn = height / minPicHeight;
  const minRn = height / maxPicHeight;

  //  общее количество рядов
  const nRows = Math.round((maxRn + minRn) / 2);

  // соотношение сторон у картинок
  const aspect = 516 / 290;

  //  высота и ширина картинки
  const picHeight = height / nRows;
  const picWidth = picHeight * aspect;

  //  количество картинок в ряду
  const nPicsPerRow = Math.ceil(width / picWidth);

  //  общее число картинок в компоненте
  const picsNumber = nRows * nPicsPerRow;

  return [nRows, picHeight, nPicsPerRow, picsNumber];
};

export default getNRowParams;
