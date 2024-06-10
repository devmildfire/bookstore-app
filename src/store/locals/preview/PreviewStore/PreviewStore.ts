import { ILocalStore } from '@/store/interfaces';

import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

export class PreviewStore implements ILocalStore {
  openTitleID: number | null = null;
  openRowID: number | null = null;

  constructor() {
    makeAutoObservable<PreviewStore>(this, {
      openRowID: observable,

      openTitleID: observable,
    });
  }

  destroy(): void {
    return;
  }
}

export const previewStore = new PreviewStore();
