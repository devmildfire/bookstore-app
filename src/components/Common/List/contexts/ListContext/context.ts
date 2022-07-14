import { createContext } from 'react';
import { ListContextOptions } from './types';

export default createContext<ListContextOptions>({
  columnGap: 100,
  rowGap: 100,
});
