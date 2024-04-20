import { createContext } from 'react';

import AuthorsStore from './AuthorsStore';

const AuthorsContext = createContext<{
  store: AuthorsStore | null;
}>({
  store: null,
});

const AuthorsStoreProvider = AuthorsContext.Provider;

export { AuthorsContext, AuthorsStoreProvider };
