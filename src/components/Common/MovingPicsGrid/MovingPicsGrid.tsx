import React, { useRef, useState, useLayoutEffect } from 'react';
import Marquee from '../Marquee';
import { StyledDiv } from './styles';
import { articles } from '@/mocks/magazine';
import splitByRows from '@/utils/splitByRows';
import getDiaShapeParams from '@/utils/getDiaShapeParams';

/**
 *
 * @param slantAngle угол поворота параллелограмма относительно горизонтали
 * против часовой стрелки
 * @param gammaAngle угол параллелограмма в градусах, прилежащий к ширине
 * родительского элемента. Вместе с углом betaAngle обуславливают форму
 * параллелограмма
 * угол gammaAngle в 120 градусов и betaAngle 30 соответствует параллелограмму с
 * внутренними углами 120 и 60 градусов. Сумма betaAngle и gammaAngle \ должна
 * быть меньше 180 градусов.
 * @returns компонент параллелограмма, описанный вокруг компонента-родителя.
 * Параллелограмм повёрнут относительно горизонтали на угол slantAngle по
 * часовой стрелке. Наполнение параллелограмма - компоненты бегущей строки
 * Marquee с картинками из массива обложек Литжурнала.
 *
 */

const keyedArticles = articles.map((item) => {
  return { ...item, key: item.name };
});

interface MovingPicsGridProps {
  slantAngle: number;
  gammaAngle: number;
  speed: number;
}

export default function MovingPicsGrid({
  slantAngle,
  gammaAngle,
  speed,
}: MovingPicsGridProps): React.ReactElement {
  const [elemHeight, setElemHeight] = useState(0);
  const [elemWidth, setElemWidth] = useState(0);
  const elemRef = useRef<HTMLDivElement>(null);

  const setSize = () => {
    if (elemRef.current) {
      setElemWidth(elemRef.current.parentElement?.offsetWidth as number);
      setElemHeight(elemRef.current.parentElement?.offsetHeight as number);
    }
  };

  useLayoutEffect(() => {
    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [elemHeight, elemWidth]);

  const [cWidth, cHeight, skewAngle] = getDiaShapeParams(
    elemWidth,
    elemHeight,
    slantAngle,
    gammaAngle
  );

  const maxPicHeight = 300;
  const minPicHeight = 200;

  const maxRn = cHeight / minPicHeight;
  const minRn = cHeight / maxPicHeight;

  const rN = Math.round((maxRn + minRn) / 2);
  const picHeight = cHeight / rN;

  const rowLength = Math.floor(keyedArticles.length / rN);
  const gridArray = splitByRows(keyedArticles, rowLength);

  // const speed = 25;

  return (
    <StyledDiv
      ref={elemRef}
      skewAngle={skewAngle}
      slantAngle={slantAngle}
      gammaAngle={gammaAngle}
      height={cHeight}
      width={cWidth}
      picHeight={picHeight}
      speed={speed}
    >
      {gridArray.map((gridRow, index) => {
        return (
          <Marquee
            key={Math.random() * 13}
            speed={speed}
            gap={0}
            direction='normal'
            delay={index * 10}
          >
            {gridRow.map((item) => {
              return (
                <img key={item.key} src={item.image} alt={speed.toString()} />
              );
            })}

            {gridRow.map((item) => {
              return (
                <img
                  key={`${item.key}second`}
                  src={item.image}
                  alt={speed.toString()}
                />
              );
            })}

            {gridRow.map((item) => {
              return (
                <img
                  key={`${item.key}third`}
                  src={item.image}
                  alt={speed.toString()}
                />
              );
            })}

            {gridRow.map((item) => {
              return (
                <img
                  key={`${item.key}fourth`}
                  src={item.image}
                  alt={speed.toString()}
                />
              );
            })}
          </Marquee>
        );
      })}
    </StyledDiv>
  );
}
