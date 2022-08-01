import { useCallback, useLayoutEffect, useRef } from 'react';
import { AnyFunction } from '@/types/common';

const useEvent = <F extends AnyFunction>(handler: F): F => {
  const handlerRef = useRef<F>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((...args) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []);
};

export default useEvent;
