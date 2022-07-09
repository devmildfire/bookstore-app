import { useEffect } from 'react';

interface UseScrollToOptions {
  readonly condition?: boolean;
  readonly timeout?: number;
}

const useScrollTo = (
  element: HTMLElement | null,
  options: UseScrollToOptions = {},
): void => {
  const { condition = true, timeout } = options;
  useEffect(() => {
    if (!element || !condition) {
      return;
    }

    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, timeout);
  }, [element, condition, timeout]);
};

export default useScrollTo;
