import { useEffect } from 'react';

const useScrollLock = (
  condition: boolean,
  element?: HTMLElement | null
): void => {
  if (typeof window !== 'undefined' && !element) {
    element = document.body;
  }
  useEffect(() => {
    if (!element) {
      return;
    }
    if (condition) {
      element.classList.add('scroll-lock');
      return () => {
        element!.classList.remove('scroll-lock');
      };
    }
  }, [condition, element]);
};

export default useScrollLock;
