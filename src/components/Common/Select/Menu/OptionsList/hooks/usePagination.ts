import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { VoidFunction } from '@/types/common';

export interface UsePaginationResult<T> {
  readonly current: T;
  readonly nextElement: VoidFunction;
  readonly prevElement: VoidFunction;
  readonly setCurrent: (option: T) => void;
}

const getDefaultValueIndex = <T>(options: T[], defaultValue?: T): number => {
  const potentialDefaultIndex = options.findIndex(
    (item) => item === defaultValue,
  );
  return potentialDefaultIndex > -1 ? potentialDefaultIndex : 0;
};

const usePagination = <T>(
  options: T[],
  defaultValue?: T | null,
): UsePaginationResult<T> => {
  const currentIndexRef = useRef<number>(
    getDefaultValueIndex(options, defaultValue),
  );
  const maxIndexRef = useRef<number>(options.length - 1);
  const [current, setCurrent] = useState<T>(options[currentIndexRef.current]);

  useEffect(() => {
    maxIndexRef.current = options.length - 1;
  }, [options.length]);

  const nextElement = useCallback(() => {
    if (currentIndexRef.current === maxIndexRef.current) {
      return;
    }
    currentIndexRef.current += 1;
    setCurrent(options[currentIndexRef.current]);
  }, [options]);
  const prevElement = useCallback(() => {
    if (currentIndexRef.current === 0) {
      return;
    }
    currentIndexRef.current -= 1;
    setCurrent(options[currentIndexRef.current]);
  }, [options]);

  const setCurrentHard = useCallback(
    (option: T) => {
      const index = options.findIndex((item) => item === option);
      if (index === -1) {
        return;
      }

      currentIndexRef.current = index;
      setCurrent(options[index]);
    },
    [options],
  );

  return {
    current,
    nextElement,
    prevElement,
    setCurrent: setCurrentHard,
  };
};

export default usePagination;
