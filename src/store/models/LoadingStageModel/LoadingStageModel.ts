import { action, computed, makeObservable, observable } from 'mobx';

import { LoadingStage } from './types';

export default class LoadingStageModel {
  state: LoadingStage = LoadingStage.notLoaded;

  constructor() {
    makeObservable(this, {
      state: observable,

      notLoaded: computed,
      loading: computed,
      loadedSuccessfully: computed,
      loadedWithError: computed,

      setState: action.bound,
      setLoading: action.bound,
      setLoadedSuccessfully: action.bound,
      setLoadedWithError: action.bound,
      reload: action.bound,
    });
  }

  get notLoaded(): boolean {
    return this.state === LoadingStage.notLoaded;
  }

  get loading(): boolean {
    return this.state === LoadingStage.loading;
  }

  get loadedSuccessfully(): boolean {
    return this.state === LoadingStage.loadedSuccessfully;
  }

  get loadedWithError(): boolean {
    return this.state === LoadingStage.loadedWithError;
  }

  setState(state: LoadingStage) {
    this.state = state;
  }

  setLoading(): void {
    this.setState(LoadingStage.loading);
  }

  setLoadedSuccessfully(): void {
    this.setState(LoadingStage.loadedSuccessfully);
  }

  setLoadedWithError(): void {
    this.setState(LoadingStage.loadedWithError);
  }

  reload(): void {
    this.setState(LoadingStage.notLoaded);
  }
}
