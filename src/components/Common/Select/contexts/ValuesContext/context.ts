import { createContext } from 'react';
import { Handler, Option, SelectValue } from '../../types';

export interface ValuesOptions<IsMulti extends boolean> {
  readonly values: Option<SelectValue>[];
  readonly selectedValue: Option<SelectValue>[];
  readonly isMulti: IsMulti;
  readonly hasValue: boolean;
}
export const valuesContext = createContext<ValuesOptions<boolean>>(
  undefined as any
);

export interface ValuesHandlersOptions {
  readonly addValue: Handler<SelectValue>;
  readonly deleteValue: Handler<SelectValue>;
}

export const valuesHandlersContext = createContext<ValuesHandlersOptions>(
  undefined as any
);
