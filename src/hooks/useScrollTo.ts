import { useEffect } from 'react';

const useScrollTo = (element: HTMLElement | null, ready: boolean) => {
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
        block: 'nearest',
      });
    }, 0);
  }, [element, ready]);
};

export default useScrollTo;
