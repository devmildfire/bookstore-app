import { useEffect } from 'react';

const useScrollTo = (
  element: HTMLElement | null,
  ready: boolean,
  delay = 250
) => {
  useEffect(() => {
    if (!element || !ready) {
      return;
    }
    /*
      отправить scrollIntoView в micotask queue,
      чтобы скролл сработал после добавления элемента(preview) в DOM
    */
    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }, delay);
  }, [element, ready, delay]);
};

export default useScrollTo;
