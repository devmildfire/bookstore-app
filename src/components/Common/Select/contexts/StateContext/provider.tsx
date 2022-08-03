import * as React from 'react';
import Context, { StateContextOptions } from './context';

type StateProviderProps = StateContextOptions

const StateProvider: React.FC<StateProviderProps> = (props) => {
  const { children, ...value } = props;
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default StateProvider;
