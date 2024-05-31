import { ILocalStore } from '@/store/interfaces';

import { adminAPI } from 'api/admin';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

export type EnumArray = Record<string, string[]>;

export class EnumArrayStore implements ILocalStore {
  private _enums: EnumArray[] | null = null;
  isLoaded = false;

  // constructor() {
  //   makeObservable<TitlesStore, '_titles'>(this, {
  //     _titles: observable,
  //   });
  // }

  constructor() {
    makeAutoObservable<EnumArrayStore, '_enums'>(this, {
      _enums: observable,
      isLoaded: observable,
    });
  }

  get enums(): EnumArray[] | null {
    return this._enums;
  }

  // get isLoaded(): boolean {
  //   return this._titles !== null && this._titles.length > 0 ? true : false;
  // }

  // get isLoaded() {
  //   return this._titles !== null && this._titles.length > 0 ? true : false;
  // }

  load = async () => {
    this.isLoaded = false;
    const { error, data } = await adminAPI.getEnums();

    if (error?.code) {
      // TODO: обработать ошибку
      return;
    }

    if (!data) {
      return;
    }

    runInAction(() => {
      this._enums = data;

      // this._enums = data.map((enum) => TitleModel.fromJson(title));
      // console.log('isLoaded is ... ', this.isLoaded);
      // console.log('setting isLoaded to true ... ');
      this.isLoaded = true;
      // console.log('isLoaded is ... ', this.isLoaded);
    });
  };

  destroy(): void {
    return;
  }
}

// export default TitlesStore;
export const enumsArrayStore = new EnumArrayStore();
