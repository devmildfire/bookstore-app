/**
 *
 * @param parentWidth ширина родительского компонента, вокруг которого
 * описан параллелограмм
 * @param parentHeight высота родительского компонента, вокруг которого
 * описан параллелограмм
 * @param betaAngle угол поворота параллелограмма относительно горизонтали
 * против часовой стрелки
 * @param gammaAngle угол параллелограмма в градусах, прилежащий к ширине
 * родительского элемента. Вместе с углом betaAngle обуславливают форму
 * параллелограмма
 * угол gammaAngle в 120 градусов и betaAngle 30 соответствует параллелограмму с
 * внутренними углами 120 и 60 градусов. Сумма betaAngle и gammaAngle \ должна
 * быть меньше 180 градусов.
 * @returns массив с шириной, высотой и углом искажения компонента
 * параллелограмма, описанного вокруг прямоугольника с шириной parentWidth
 * и высотой parentHeight
 */
const getDiaShapeParams = (
  parentWidth: number,
  parentHeight: number,
  betaAngle: number,
  gammaAngle: number
): number[] => {
  const alphaAngle = 180 - betaAngle - gammaAngle;
  const betaRad = (betaAngle * Math.PI) / 180;
  const alphaRad = (alphaAngle * Math.PI) / 180;

  const skewAngle = 90 - alphaAngle - betaAngle;

  const sinA = Math.sin(alphaRad);
  const cosA = Math.cos(alphaRad);

  const sinB = Math.sin(betaRad);
  const cosB = Math.cos(betaRad);

  const tanA = sinA / cosA;
  const tanB = sinB / cosB;

  const k1 = tanB / tanA;
  const k2 = 1 / k1;

  const c1 = (parentWidth * k1) / ((k1 + 1) * cosA);
  const c2 = parentWidth / ((k1 + 1) * cosB);

  const c3 = (parentHeight * k2) / ((k2 + 1) * sinA);
  const c4 = parentHeight / ((k2 + 1) * sinB);

  const childWidth = c2 + c4;
  const childHeight = (c1 + c3) * Math.cos(-alphaRad - betaRad + Math.PI / 2);

  return [childWidth, childHeight, skewAngle];
};

export default getDiaShapeParams;
