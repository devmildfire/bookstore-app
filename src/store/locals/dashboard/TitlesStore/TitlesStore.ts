import { ILocalStore } from '@/store/interfaces';
import { TitleModel } from '@/store/models/title/TitleModel';

import { adminAPI } from 'api/admin';
import { makeObservable, observable, runInAction } from 'mobx';

class TitlesStore implements ILocalStore {
  private _titles: TitleModel[] | null = null;

  constructor() {
    makeObservable<TitlesStore, '_titles'>(this, {
      _titles: observable,
    });
  }

  get authors(): TitleModel[] | null {
    return this._titles;
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
