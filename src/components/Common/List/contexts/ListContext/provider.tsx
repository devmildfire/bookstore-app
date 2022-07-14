import * as React from 'react';
import ListContext from './context';
import { ListContextOptions } from './types';

interface ListContextProviderProps extends ListContextOptions {}

const ListContextProvider: React.FC<ListContextProviderProps> = (props) => {
  const { children, columnGap, rowGap } = props;
  return (
    <ListContext.Provider value={{ columnGap, rowGap }}>
      {children}
    </ListContext.Provider>
  );
};

export default ListContextProvider;
