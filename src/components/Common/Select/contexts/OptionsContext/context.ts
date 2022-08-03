import { createContext } from 'react';
import { Handler, Option, SelectValue } from '../../types';

export interface OptionsContextOptions<IsMulti extends boolean> {
  readonly options: Option<SelectValue>[];
  readonly selectedValue: Option<SelectValue>[];
  readonly addValue: Handler<SelectValue>;
  readonly deleteValue: Handler<SelectValue>;
  readonly isMulti: IsMulti;
}
export default createContext<OptionsContextOptions<boolean>>(undefined as any);
