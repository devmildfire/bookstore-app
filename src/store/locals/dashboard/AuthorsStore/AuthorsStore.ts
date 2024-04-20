import { ILocalStore } from '@/store/interfaces';

import { AuthorPreviewModel } from '@/store/models/author';
import { adminAPI } from 'api/admin';
import { makeObservable, observable, runInAction } from 'mobx';

class AuthorsStore implements ILocalStore {
  private _authors: AuthorPreviewModel[] | null = null;

  constructor() {
    makeObservable<AuthorsStore, '_authors'>(this, {
      _authors: observable,
    });
  }

  get authors(): AuthorPreviewModel[] | null {
    return this._authors;
  }

  load = async () => {
    const { error, data } = await adminAPI.getAuthors();

    if (error?.code) {
      // TODO: обработать ошибку
      return;
    }

    if (!data) {
      return;
    }

    runInAction(() => {
      this._authors = data.map((author) => AuthorPreviewModel.fromJson(author));
    });
  };

  destroy(): void {
    return;
  }
}

export default AuthorsStore;
