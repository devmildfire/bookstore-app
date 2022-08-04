import { useEffect, RefObject } from 'react';
import { VoidFunction } from '@/types/common';

export interface UseClickAwayOptions {
  readonly elementRef: RefObject<HTMLElement | null>;
  readonly onClickAway: VoidFunction;
  readonly condition?: boolean;
}

const useClickAway = (options: UseClickAwayOptions): void => {
  const { elementRef, onClickAway, condition = true } = options;

  useEffect(() => {
    if (!elementRef.current || !condition) {
      return;
    }
    const element = elementRef.current;

    const handler = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      if (!target.contains(element) || target !== element) {
        onClickAway();
      }
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [elementRef.current, onClickAway, condition]);
};

export default useClickAway;
