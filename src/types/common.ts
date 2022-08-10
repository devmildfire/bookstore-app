export type ID = number | string;

export interface ParsedURLQuery {
  readonly [key: string]: string | string[] | undefined;
}

export type VoidFunction = () => void;

export type AnyFunction = (...args: any[]) => any;

export interface Item {
  readonly id: number;
}

export type AnyObject = Record<string, unknown>;

export type AddType<T extends AnyObject, AT> = {
  [K in keyof T]: T[K] | AT;
};
