import * as React from 'react';
import { PropsWithChildren } from 'react';
import {
  StateContextOptions,
  StateHandlersContextOptions,
  stateContext,
  stateHandlersContext,
} from './context';

interface StateProviderProps
  extends StateContextOptions,
    StateHandlersContextOptions {}

const StateProvider: React.FC<PropsWithChildren<StateProviderProps>> = (
  props
) => {
  const { children, isOpen, isLoading, root, onClose, onOpen } = props;
  return (
    <stateContext.Provider
      value={{
        isOpen,
        isLoading,
        root,
      }}
    >
      <stateHandlersContext.Provider value={{ onClose, onOpen }}>
        {children}
      </stateHandlersContext.Provider>
    </stateContext.Provider>
  );
};

export default StateProvider;
