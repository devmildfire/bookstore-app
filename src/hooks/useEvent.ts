import { useCallback, useRef } from 'react';
import { AnyFunction } from '@/types/common';

const useEvent = <F extends AnyFunction>(handler: F): F => {
  const handlerRef = useRef<F>(handler);

  handlerRef.current = handler;

  return useCallback((...args: any[]) => {
    const fn = handlerRef.current;
    return fn(...args);
  }, []) as unknown as F;
};

export default useEvent;
