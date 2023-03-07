import React, {
  // PropsWithChildren,
  // ReactElement,
  // useLayoutEffect,
  useRef,
  // useEffect,
  useState,
  useLayoutEffect,
} from 'react';
// import crypto from 'crypto';
// import { v4 } from 'uuid';
import Marquee from '../Marquee';
import { StyledDiv } from './styles';
import { articles } from '@/mocks/magazine';
import splitByRows from '@/utils/splitByRows';

// import { v4 as uuidv4 } from 'uuid';

const keyedArticles = articles.map((item) => {
  return { ...item, key: item.name };
});

export default function MovingPicsGrid(): React.ReactElement {
  // props: PropsWithChildren<MarqueeProps>
  const [elemHeight, setElemHeight] = useState(0);
  const [elemWidth, setElemWidth] = useState(0);
  const elemRef = useRef<HTMLDivElement>(null);

  const setSize = () => {
    if (elemRef.current) {
      setElemWidth(elemRef.current.parentElement?.offsetWidth as number);
      setElemHeight(elemRef.current.parentElement?.offsetHeight as number);
    }
  };

  // useEffect(() => {
  //   setSize();
  //   window.addEventListener('resize', setSize);
  //   return () => window.removeEventListener('resize', setSize);
  // }, [elemHeight, elemWidth]);

  useLayoutEffect(() => {
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

  const rowLength = Math.floor(keyedArticles.length / rN);
  const gridArray = splitByRows(keyedArticles, rowLength);

  const speed = 25;

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
              // return <img alt={'row number ' + index + 'item ' + item.id} />;
            })}

            {/* {gridRow.map((item) => {
              return <img key={Math.random() * 17} src={item.image} alt='1' />;
              // return <img alt={'row number ' + index + 'item ' + item.id} />;
            })}

            {gridRow.map((item) => {
              return <img key={Math.random() * 19} src={item.image} alt='1' />;
              // return <img alt={'row number ' + index + 'item ' + item.id} />;
            })}

            {gridRow.map((item) => {
              return <img key={Math.random() * 23} src={item.image} alt='1' />;
              // return <img alt={'row number ' + index + 'item ' + item.id} />;
            })} */}
          </Marquee>
        );
      })}
    </StyledDiv>
  );
}
