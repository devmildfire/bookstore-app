import { createContext } from 'react';
import { VoidFunction } from '@/types/common';

export interface StateContextOptions {
  readonly isOpen: boolean;
  readonly onOpen: VoidFunction;
  readonly onClose: VoidFunction;
  readonly onFocus: VoidFunction;
  readonly onBlur: VoidFunction;
}

export default createContext<StateContextOptions>({
  isOpen: false,
  onBlur: () => undefined,
  onFocus: () => undefined,
  onClose: () => undefined,
  onOpen: () => undefined,
});
