import { ILocalStore } from '@/store/interfaces';

import { adminAPI } from 'api/admin';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

export type EnumArray = Record<string, string[]>[];
export type EnumObj = Record<string, string[]>;

export class EnumArrayStore implements ILocalStore {
  private _enums: EnumObj | null = null;
  isLoaded = false;

  constructor() {
    makeAutoObservable<EnumArrayStore, '_enums'>(this, {
      _enums: observable,
      isLoaded: observable,
    });
  }

  get enums(): EnumObj | null {
    return this._enums;
  }

  load = async () => {
    this.isLoaded = false;
    const bigEnumsArray = await adminAPI.getEnums();
    // console.log('big enums array is ... ', bigEnumsArray);

    const cutEnums = bigEnumsArray?.filter(
      (item) => item.enum_schema === 'public'
    );

    const aggregatedEnums: Record<string, string[]> = {};

    cutEnums?.forEach((item) => {
      const key = item.enum_name;
      const value = item.enum_value;

      if (key in aggregatedEnums) {
        aggregatedEnums[key].push(value);
      } else {
        aggregatedEnums[key] = [value];
      }
    });

    runInAction(() => {
      this._enums = aggregatedEnums;

      this.isLoaded = true;
      console.log('enums are loaded ... ', this.isLoaded);
    });
  };

  destroy(): void {
    return;
  }
}

export const enumsArrayStore = new EnumArrayStore();
