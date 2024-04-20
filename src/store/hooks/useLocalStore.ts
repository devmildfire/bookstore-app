import * as React from 'react';

import { ILocalStore } from '@/store/interfaces';

import { RootStore, useRootStore } from '../globals';

export const useLocalStore = <S extends ILocalStore = any>(
  creator: (rootStore: RootStore) => S,
  effect: any[] = []
): S => {
  const rootStore = useRootStore();
  const store = React.useRef(creator(rootStore));
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    return () => {
      store.current?.destroy();
    };
  }, []);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    store.current.destroy();
    store.current = creator(rootStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, effect);

  return store.current;
};
