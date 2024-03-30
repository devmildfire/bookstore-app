import { MobXProviderContext } from 'mobx-react';
import * as React from 'react';

import { RootStore } from './RootStore';

export function useRootStore(): RootStore {
  return React.useContext(MobXProviderContext).rootStore as RootStore;
}
