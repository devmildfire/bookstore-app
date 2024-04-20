import { AuthorFormFields } from '@/entities/author';
import { ILocalStore } from '@/store/interfaces';
import { AuthorModel } from '@/store/models/author';
import { createSlug } from '@/utils/createSlug';
import { adminAPI } from 'api/admin';
import { makeObservable, observable, runInAction } from 'mobx';
import { toast } from 'sonner';

type InitialData = {
  id: string;
};

class AuthorStore implements ILocalStore {
  readonly id: string;
  private _author: AuthorModel | null = null;

  constructor({ id }: InitialData) {
    makeObservable<AuthorStore, '_author'>(this, {
      id: observable,
      _author: observable,
    });

    this.id = id;
  }

  get author(): AuthorModel | null {
    return this._author;
  }

  load = async () => {
    const { error, data } = await adminAPI.getAuthorById(this.id);

    if (error?.code) {
      // TODO: обработать ошибку
      return;
    }

    if (!data) {
      return;
    }

    runInAction(() => {
      this._author = AuthorModel.fromJson(data);
    });
  };

  update = async (payload: AuthorFormFields) => {
    if (!this._author) {
      return;
    }


    //  имя автора может измениться. Это приведёт к тому, что this._author.name
    //  из предыдущего upload будет не таким как из текущего.
    //  то есть будут загружены два разных изображения с разными именами
    //  и предыдущее (уже не использующееся) будет висеть в storage.
    //  стоит скорее всего удалять предыдущее изображение
    //  по строке photo из базы  прежде чем  загружать следующее    
    await this._author.photo.upload(createSlug(this._author.name));

    const { data, error } = await adminAPI.updateAuthor({
      id: this._author.id,
      bio: payload.bio,
      city: payload.city,
      name: payload.name,
      phrase: payload.phrase,
      photo: this._author.photo.src,
      birth_date: payload.birthDate ? payload.birthDate.toISOString() : null,
      death_date: payload.deathDate ? payload.deathDate.toISOString() : null,
    });

    if (error?.code) {
      toast.error('Не удалось обновить автора. Попытайтесь снова.');
    }

    if (!data) {
      return;
    }

    runInAction(() => {
      this._author = AuthorModel.fromJson(data);
    });
  };

  destroy(): void {
    return;
  }
}

export default AuthorStore;
