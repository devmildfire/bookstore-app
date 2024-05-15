import { ILocalStore } from '@/store/interfaces';
import { TitleModel } from '@/store/models/title/TitleModel';

import { adminAPI } from 'api/admin';
import { makeAutoObservable, observable, runInAction } from 'mobx';

export class TitlesStore implements ILocalStore {
  private _titles: TitleModel[] | null = null;

  // constructor() {
  //   makeObservable<TitlesStore, '_titles'>(this, {
  //     _titles: observable,
  //   });
  // }

  constructor() {
    makeAutoObservable<TitlesStore, '_titles'>(this, {
      _titles: observable,
    });
  }

  get titles(): TitleModel[] | null {
    return this._titles;
  }

  get isLoaded(): boolean {
    return this._titles !== null && this._titles.length > 0 ? true : false;
  }

  load = async () => {
    const { error, data } = await adminAPI.getTitles();

    if (error?.code) {
      // TODO: обработать ошибку
      return;
    }

    if (!data) {
      return;
    }

    runInAction(() => {
      this._titles = data.map((title) => TitleModel.fromJson(title));
    });
  };

  destroy(): void {
    return;
  }
}

export default TitlesStore;
// export const titlesStore = new TitlesStore();
