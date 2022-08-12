import { createContext } from 'react';
import { VoidFunction } from '@/types/common';

export interface StateContextOptions {
  readonly isOpen: boolean;
  readonly isLoading: boolean;
  readonly root: HTMLElement | null;
}

export interface StateHandlersContextOptions {
  readonly onOpen: VoidFunction;
  readonly onClose: VoidFunction;
}

export const stateContext = createContext<StateContextOptions>(
  undefined as any
);

export const stateHandlersContext = createContext<StateHandlersContextOptions>(
  undefined as any
);
