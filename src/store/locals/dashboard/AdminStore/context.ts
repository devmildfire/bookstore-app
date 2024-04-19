import { createContext } from 'react';

import AdminStore from './AdminStore';

const AdminContext = createContext<{
  store: AdminStore | null;
}>({
  store: null,
});

const AdminStoreProvider = AdminContext.Provider;

export { AdminContext, AdminStoreProvider };
