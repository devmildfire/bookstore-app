import { useEffect } from 'react';
import { VoidFunction } from '@/types/common';

export interface UseClickAwayOptions {
  readonly elementRef: HTMLElement | null;
  readonly onClickAway: VoidFunction;
  readonly condition?: boolean;
}

const useClickAway = (options: UseClickAwayOptions): void => {
  const { elementRef, onClickAway, condition = true } = options;

  useEffect(() => {
    if (!elementRef || !condition) {
      return;
    }
    const element = elementRef;

    const handler = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      if (!element.contains(target)) {
        onClickAway();
      }
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [elementRef, onClickAway, condition]);
};

export default useClickAway;
