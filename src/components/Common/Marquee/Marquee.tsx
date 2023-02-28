import React, {
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { MarqueeContent, MarqueeWrapper } from './styles';

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      const { current } = ref.current;
      setWidth(current.offsetWidth);
    }
  }, []);

  return { ref, width };
}

interface MarqueeProps {
  speed: number;
  gap: number;
  direction: string;
  delay: number;
}

/**
 * Компонент бегущей строки.
 *
 * @param {number} speed              скорость прокрутки в секундах
 * @param {number} gap                расстояние между элементами в пикселях
 * @param {string} direction          направление движения: 'reverse' или 'normal'
 * @param {number} delay              задержка анимации в секундах
 * @param {ReactChildren} children    элементы бегущей строки
 */
export default function Marquee(props: PropsWithChildren<MarqueeProps>) {
  const { ref, width } = useWidth<HTMLUListElement>();
  const { speed, gap, direction, delay = 0, children } = props;
  return (
    <MarqueeWrapper gap={gap}>
      <MarqueeContent
        ref={ref}
        width={width}
        speed={speed}
        direction={direction}
        delay={delay}
      >
        {children}
      </MarqueeContent>
      <MarqueeContent
        speed={speed}
        direction={direction}
        delay={delay}
        aria-hidden='true'
      >
        {children}
      </MarqueeContent>
    </MarqueeWrapper>
  );
}
