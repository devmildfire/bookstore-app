import React, {
  PropsWithChildren,
  // ReactElement,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { MarqueeContent, MarqueeWrapper } from './styles';

interface MarqueeProps {
  speed: number;
  gap: number;
  direction: string;
  delay: number;
}

function useMarqueeTiming<T extends HTMLElement>(speed: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      const { current } = ref;
      setWidth(current.offsetWidth);
    }
  }, []);

  return { ref, time: width / speed };
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
export default function Marquee(
  props: PropsWithChildren<MarqueeProps>
): React.ReactElement {
  const { speed, gap, direction, delay = 0, children } = props;
  const { ref, time } = useMarqueeTiming<HTMLUListElement>(speed);
  return (
    <MarqueeWrapper gap={gap}>
      <MarqueeContent ref={ref} time={time} direction={direction} delay={delay}>
        {children}
      </MarqueeContent>
      <MarqueeContent
        time={time}
        direction={direction}
        delay={delay}
        aria-hidden='true'
      >
        {children}
      </MarqueeContent>
    </MarqueeWrapper>
  );
}
