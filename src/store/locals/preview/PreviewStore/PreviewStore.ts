import { ILocalStore } from '@/store/interfaces';
import { TitleModel } from '@/store/models/title/TitleModel';

// import { adminAPI } from 'api/admin';
import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

export class PreviewStore implements ILocalStore {
  // private _titleRows: TitleModel[][] | null = null;

  // private _titleRows: TitleModel[][] = [];

  // const [width] = useScreenSize();

  openTitleID: number | null = null;
  openRowID: number | null = null;
  // isLoaded = false;

  // constructor() {
  //   makeObservable<TitlesStore, '_titles'>(this, {
  //     _titles: observable,
  //   });
  // }

  constructor() {
    // makeAutoObservable<PreviewStore, '_titleRows'>(this, {
    makeAutoObservable<PreviewStore>(this, {
      // _titleRows: observable,
      // isLoaded: observable,
      openRowID: observable,

      openTitleID: observable,
    });
  }

  // get titleRows(): TitleModel[][] {
  //   // return this._titleRows;

  // }

  // get isLoaded(): boolean {
  //   return this._titles !== null && this._titles.length > 0 ? true : false;
  // }

  // get isLoaded() {
  //   return this._titles !== null && this._titles.length > 0 ? true : false;
  // }

  // load = async (titleRows: TitleModel[][]) => {
  //   this.isLoaded = false;

  //   if (!titlesStore.titles) {
  //     return;
  //   }

  //   runInAction(() => {
  //     this._titleRows = data.map((title) => TitleModel.fromJson(title));
  //     // console.log('isLoaded is ... ', this.isLoaded);
  //     // console.log('setting isLoaded to true ... ');

  //     this.isLoaded = true;
  //     // console.log('isLoaded is ... ', this.isLoaded);
  //   });
  // };

  // load = async () => {
  //   this.isLoaded = false;

  //   if (!titlesStore.titles) {
  //     return;
  //   }

  //   runInAction(() => {
  //     this._titleRows = data.map((title) => TitleModel.fromJson(title));
  //     // console.log('isLoaded is ... ', this.isLoaded);
  //     // console.log('setting isLoaded to true ... ');

  //     this.isLoaded = true;
  //     // console.log('isLoaded is ... ', this.isLoaded);
  //   });
  // };

  destroy(): void {
    return;
  }
}

export const previewStore = new PreviewStore();
