import { createContext } from 'react';
import { VoidFunction } from '@/types/common';

export interface StateContextOptions {
  readonly isOpen: boolean;
  readonly isFocus: boolean;
  readonly hasValue: boolean;
  readonly onOpen: VoidFunction;
  readonly onClose: VoidFunction;
  readonly onFocus: VoidFunction;
  readonly onBlur: VoidFunction;
}

export default createContext<StateContextOptions>(undefined as any);
