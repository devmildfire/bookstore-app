import * as React from 'react';

import FiltersStore from './FiltersStore';
import { FiltersContext } from './context';

const useFiltersStore = (): FiltersStore => {
  const filtersContext = React.useContext(FiltersContext);

  return filtersContext.filters as FiltersStore;
};

export * from './context';

export { FiltersStore as FiltersStore, useFiltersStore };
