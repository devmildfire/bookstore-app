'use client';
import React, { useRef, useState, useEffect } from 'react';
import Marquee from '../Marquee';
import { StyledDiv } from './styles';
import { articles } from '@/mocks/magazine';
import splitByRows from '@/utils/splitByRows';
import getDiaShapeParams from '@/utils/MovingPicsGridUtils/getDiaShapeParams';
import getNRowParams from '@/utils/MovingPicsGridUtils/getNRowParams ';

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
  // return { ...item, key: item.name }; в мокапе есть повторяющиеся названия
  return { ...item, key: Math.random() * 1001 };
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

  // useLayoutEffect(() => {
  //  Использование useEffect вместо useLayoutEffect так как этот компонент использует SSR и отрисовывается на сервере, а там не сработает useLayoutEffect
  //  исправлено по указаниям из темы https://reactjs.org/link/uselayouteffect-ssr
  useEffect(() => {
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

  const [nRows, picHeight, nPicsPerRow, picsNumber] = getNRowParams(
    maxPicHeight,
    minPicHeight,
    cWidth,
    cHeight
  );

  const gridArray = splitByRows(
    keyedArticles.slice(0, picsNumber),
    nPicsPerRow
  );

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
      // количество рядов и общее число картинок в компоненте выводятся
      // для отладки
      rowsNumber={nRows}
      totalPictures={picsNumber}
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
          </Marquee>
        );
      })}
    </StyledDiv>
  );
}
