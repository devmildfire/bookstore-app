import { action, makeObservable } from 'mobx';
import { LoadingStageModel } from '@/store/models/LoadingStageModel';

export class RootStore {
  appState = new LoadingStageModel();

  constructor() {
    makeObservable(this, {
      init: action.bound,
    });
  }

  async init(): Promise<boolean> {
    this.appState.setLoading();

    return true;
  }
}

const rootStore = new RootStore();

export const stores = { rootStore };
