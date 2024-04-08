import * as React from 'react';

import AuthorsStore from './AuthorsStore';
import { AuthorsContext } from './context';

const useAuthorsStore = (): AuthorsStore => {
  const authorsContext = React.useContext(AuthorsContext);

  return authorsContext.store as AuthorsStore;
};

export * from './context';

export { AuthorsStore, useAuthorsStore };
