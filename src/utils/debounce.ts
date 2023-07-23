import { AnyFunction } from '@/types/common';

/**
 *
 * @param callback функция, для которой включается debounce (ожидание
 * исполнения до момента, когда после последнего вызова функции пройдёт
 * заданное время)
 * @param wait интервал времени в мс, который должен пройти с момента вызова
 * функции до начала её исполнения
 * @returns  вызов функции с эффектом debounce - то есть исполнение по прошествии
 * определённого интервала времени с момента последнего вызова
 *
 */

export function debounce<A = unknown>(
  callback: AnyFunction,
  wait: number | undefined
) {
  let timeoutId: number | undefined;
  return (...args: A[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      // eslint-disable-next-line prefer-spread
      callback.apply(null, args);
    }, wait);
  };
}

export default debounce;
