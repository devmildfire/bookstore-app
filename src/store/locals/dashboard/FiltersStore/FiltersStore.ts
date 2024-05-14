import { ILocalStore } from '@/store/interfaces';
import FilterModel from '@/store/models/filters/FilterModel/FilterModel';
import { makeAutoObservable, observable, runInAction } from 'mobx';

class FiltersStore implements ILocalStore {
  private _filters: FilterModel | null = null;

  constructor() {
    makeAutoObservable<FiltersStore, '_filters'>(this, {
      _filters: observable,
    });
  }

  get filters(): FilterModel | null {
    return this._filters;
  }

  set = (filters: FilterModel) => {
    this._filters = filters;
  };

  destroy(): void {
    return;
  }
}

export default FiltersStore;
