import * as React from 'react';

import AdminStore from './AdminStore';
import { AdminContext } from './context';

const useAdminStore = (): AdminStore => {
  const adminContext = React.useContext(AdminContext);

  return adminContext.store as AdminStore;
};

export * from './context';

export { AdminStore, useAdminStore };
