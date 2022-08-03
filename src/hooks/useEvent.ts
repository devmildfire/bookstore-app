import { useCallback, useLayoutEffect, useRef } from 'react';
import { AnyFunction } from '@/types/common';

const useEvent = <F extends AnyFunction>(handler: F): F => {
  const handlerRef = useRef<F>(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((...args: any[]) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []) as unknown as F;
};

export default useEvent;
