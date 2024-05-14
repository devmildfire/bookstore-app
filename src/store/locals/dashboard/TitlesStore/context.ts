import { createContext } from 'react';
import { TitlesStore } from './TitlesStore';

const TitlesContext = createContext<{
  store: TitlesStore | null;
}>({
  store: null,
});

const TitlesStoreProvider = TitlesContext.Provider;

export { TitlesContext, TitlesStoreProvider };
