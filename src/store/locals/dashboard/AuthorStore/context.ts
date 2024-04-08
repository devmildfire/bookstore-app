import { createContext } from 'react';

import AuthorStore from './AuthorStore';

const AuthorContext = createContext<{
  store: AuthorStore | null;
}>({
  store: null,
});

const AuthorStoreProvider = AuthorContext.Provider;

export { AuthorContext, AuthorStoreProvider };
