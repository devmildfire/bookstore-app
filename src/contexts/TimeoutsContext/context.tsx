import { createContext } from 'react';

export interface TimeoutsContextOptions {
  readonly fade: number;
  readonly collapse: number;
}

export const defaultTimeouts: TimeoutsContextOptions = {
  collapse: 300,
  fade: 300,
};

export default createContext<TimeoutsContextOptions>(defaultTimeouts);
