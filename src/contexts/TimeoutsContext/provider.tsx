import * as React from 'react';
import Context, { defaultTimeouts, TimeoutsContextOptions } from './context';

interface TimeoutsProviderProps {
  readonly timeouts?: TimeoutsContextOptions;
}

const TimeoutsProvider: React.FC<
  React.PropsWithChildren<TimeoutsProviderProps>
> = (props) => {
  const { timeouts = {}, children } = props;

  const value = { ...defaultTimeouts, ...timeouts };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default TimeoutsProvider;
