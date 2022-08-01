export type ID = number | string;

export type VoidFunction = () => void;

export type AnyFunction = (...args: any[]) => any;

export interface Item {
  readonly id: number;
}
