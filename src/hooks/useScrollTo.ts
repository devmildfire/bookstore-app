import { useEffect } from 'react';

// type Anchor = 'top' | 'bottom';

interface UseScrollToOptions {
  readonly condition?: boolean;
}

const useScrollTo = (
  element: HTMLElement | null,
  options: UseScrollToOptions = {},
): void => {
  const { condition = true } = options;
  useEffect(() => {
    if (!element || !condition) {
      return;
    }

    element.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });

    /*     const x = 0;
    const y =
      anchor === 'top'
        ? element.scrollHeight
        : element.scrollHeight + element.clientHeight;
    window.scrollTo(x, y); */
  }, [element, condition]);
};

export default useScrollTo;
