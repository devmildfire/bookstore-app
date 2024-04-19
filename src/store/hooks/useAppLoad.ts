import * as React from 'react';

import { useRootStore } from '@/store/globals';

type UseAppLoadType = {
  loadedSuccessfully: boolean;
  loadedWithError: boolean;
  loading: boolean;
};

const LOADER_DURATION = 1000;

export const useAppLoad = (): UseAppLoadType => {
  const rootStore = useRootStore();

  const isFirstRender = React.useRef(true);

  const playLoader = async () => {
    return new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, LOADER_DURATION);
    });
  };

  React.useEffect(() => {
    if (rootStore.appState.notLoaded && !rootStore.appState.loading) {
      const callbacks: (() => Promise<boolean | void>)[] = [rootStore.init];

      if (isFirstRender.current) {
        // NOTE: при необходимости загружать статику здесь
      }

      Promise.all(callbacks.map((callback) => callback())).then(
        ([initSuccess]) => {
          if (!initSuccess) {
            return;
          }

          if (isFirstRender.current) {
            isFirstRender.current = false;
          }

          playLoader().then(() => {
            rootStore.appState.setLoadedSuccessfully();
          });
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootStore.appState.notLoaded]);

  return {
    loading: rootStore.appState.loading,
    loadedSuccessfully: rootStore.appState.loadedSuccessfully,
    loadedWithError: rootStore.appState.loadedWithError,
  };
};
