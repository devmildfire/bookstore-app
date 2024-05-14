import { createContext } from 'react';
import { TitlesStore } from './TitlesStore';
import { AuthorsStore } from '../AuthorsStore';
import { FiltersStore } from '../FiltersStore';

const TitlesContext = createContext<{
  store: TitlesStore | null;
}>({
  store: null,
});

const TitlesStoreProvider = TitlesContext.Provider;

const MultipleStoresContext = createContext<{
  titleStore: TitlesStore | null;
  filterStore: FiltersStore | null;
}>({
  titleStore: null,
  filterStore: null,
});

const MultipleStoresProvider = MultipleStoresContext.Provider;

export {
  TitlesContext,
  TitlesStoreProvider,
  MultipleStoresContext,
  MultipleStoresProvider,
};
