import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { VoidFunction } from '@/types/common';

export interface UsePaginationOptions<T> {
  readonly loop?: boolean;
  readonly defaultValue?: T;
}

export interface UsePaginationResult<T> {
  readonly current: T;
  readonly nextElement: VoidFunction;
  readonly prevElement: VoidFunction;
  readonly setCurrent: (option: T) => void;
}

const getDefaultValueIndex = <T>(items: T[], defaultValue?: T): number => {
  const potentialDefaultIndex = items.findIndex(
    (item) => item === defaultValue,
  );
  return potentialDefaultIndex > -1 ? potentialDefaultIndex : 0;
};

const usePagination = <T>(
  items: T[],
  options: UsePaginationOptions<T> = {},
): UsePaginationResult<T> => {
  const { defaultValue, loop } = options;
  const currentIndexRef = useRef<number>(
    getDefaultValueIndex(items, defaultValue),
  );
  const maxIndexRef = useRef<number>(items.length - 1);
  const [current, setCurrent] = useState<T>(items[currentIndexRef.current]);

  useEffect(() => {
    maxIndexRef.current = items.length - 1;
  }, [items.length]);

  const nextElement = useCallback(() => {
    const isEnd = currentIndexRef.current === maxIndexRef.current;
    if (!loop && isEnd) {
      return;
    }
    currentIndexRef.current = isEnd ? 0 : currentIndexRef.current + 1;
    setCurrent(items[currentIndexRef.current]);
  }, [items]);

  const prevElement = useCallback(() => {
    const isEnd = currentIndexRef.current === 0;
    if (!loop && isEnd) {
      return;
    }
    currentIndexRef.current = isEnd
      ? maxIndexRef.current
      : currentIndexRef.current - 1;
    setCurrent(items[currentIndexRef.current]);
  }, [items]);

  const setCurrentHard = useCallback(
    (option: T) => {
      const index = items.findIndex((item) => item === option);
      if (index === -1) {
        return;
      }

      currentIndexRef.current = index;
      setCurrent(items[index]);
    },
    [items],
  );

  return {
    current,
    nextElement,
    prevElement,
    setCurrent: setCurrentHard,
  };
};

export default usePagination;
