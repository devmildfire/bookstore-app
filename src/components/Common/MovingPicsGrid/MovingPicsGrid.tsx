import React, {
  // PropsWithChildren,
  // ReactElement,
  // useLayoutEffect,
  useRef,
  useEffect,
  useState,
} from 'react';
import Marquee from '../Marquee';
import { StyledDiv } from './styles';
import { articles } from '@/mocks/magazine';
import splitByRows from '@/utils/splitByRows';

// interface MarqueeProps {
//   speed: number;
//   gap: number;
//   direction: string;
//   delay: number;
// }

// function useMarqueeTiming<T extends HTMLElement>(speed: number) {
//   const ref = useRef<T>(null);
//   const [width, setWidth] = useState(0);

//   useLayoutEffect(() => {
//     if (ref.current) {
//       const { current } = ref;
//       setWidth(current.offsetWidth);
//     }
//   }, []);

//   return { ref, time: width / speed };
// }

/**
 * Компонент бегущей строки.
 *
 * @param {number} speed              скорость прокрутки в секундах
 * @param {number} gap                расстояние между элементами в пикселях
 * @param {string} direction          направление движения: 'reverse' или 'normal'
 * @param {number} delay              задержка анимации в секундах
 * @param {ReactChildren} children    элементы бегущей строки
 */
export default function MovingPicsGrid(): React.ReactElement {
  // props: PropsWithChildren<MarqueeProps>
  const [elemHeight, setElemHeight] = useState(0);
  const [elemWidth, setElemWidth] = useState(0);
  const elemRef = useRef<HTMLDivElement>(null);

  const setSize = () => {
    if (elemRef.current) {
      // const parentHeight = elemRef.current.offsetHeight;
      // const parentWidth = elemRef.current.offsetWidth;

      // const cos30 = Math.cos(Math.PI / 6);

      // const childWidth = parentWidth / (2 * cos30) + parentHeight;
      // const childHeight = parentWidth / 2 + parentHeight * cos30;

      // setElemWidth(childWidth);
      // setElemHeight(childHeight);

      // setElemWidth(elemRef.current.offsetWidth);
      // setElemHeight(elemRef.current.offsetHeight);

      setElemWidth(elemRef.current.parentElement?.offsetWidth as number);
      setElemHeight(elemRef.current.parentElement?.offsetHeight as number);
    }
  };

  useEffect(() => {
    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [elemHeight, elemWidth]);

  const cos30 = Math.cos(Math.PI / 6);

  const childWidth = Math.floor(elemWidth / (2 * cos30) + elemHeight);
  const childHeight = Math.floor(elemWidth / 2 + elemHeight * cos30);

  const maxPicHeight = 300;
  const minPicHeight = 200;

  const maxRn = childHeight / minPicHeight;
  const minRn = childHeight / maxPicHeight;

  const rN = Math.round((maxRn + minRn) / 2);
  const picHeight = childHeight / rN;

  const rowLength = Math.floor(articles.length / rN);
  const gridArray = splitByRows(articles, rowLength);

  return (
    // <GridWrapper>
    //   <Gridontent>
    //     {children}
    //   </GridContent>
    // </GridWrapper>
    <StyledDiv
      ref={elemRef}
      height={childHeight}
      width={childWidth}
      picHeight={picHeight}
    >
      {gridArray.map((gridRow, index) => {
        return (
          <Marquee
            key={Math.random() * 33}
            speed={50}
            gap={0}
            direction='normal'
            delay={index * 10}
          >
            {gridRow.map((item) => {
              return <img key={Math.random() * 13} src={item.image} alt='1' />;
              // return <img alt={'row number ' + index + 'item ' + item.id} />;
            })}
          </Marquee>
        );
      })}
    </StyledDiv>
  );
}
