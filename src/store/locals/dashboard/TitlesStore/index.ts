import * as React from 'react';

import TitlesStore from './TitlesStore';
import { TitlesContext } from './context';

const useTitlesStore = (): TitlesStore => {
  const titlesContext = React.useContext(TitlesContext);

  return titlesContext.store as TitlesStore;
};

export * from './context';

export { TitlesStore, useTitlesStore };
