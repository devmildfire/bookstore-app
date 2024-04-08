import * as React from 'react';

import AuthorStore from './AuthorStore';
import { AuthorContext } from './context';

const useAuthorStore = (): AuthorStore => {
  const authorContext = React.useContext(AuthorContext);

  return authorContext.store as AuthorStore;
};

export * from './context';

export { AuthorStore, useAuthorStore };
