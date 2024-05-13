import { createContext } from 'react';
import { TitlesStore } from './TitlesStore';

// import TitlesStore from './TitlesStore';

// const TitlesContext = createContext<{
//   store: TitlesStore | null;
// }>({
//   store: null,
// });

const TitlesContext = createContext<TitlesStore | null>(null);

const TitlesStoreProvider = TitlesContext.Provider;

export { TitlesContext, TitlesStoreProvider };
