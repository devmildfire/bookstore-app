import { ILocalStore } from '@/store/interfaces';
import { AuthorModel } from '@/store/models/author';
import { adminAPI } from 'api/admin';
import { makeObservable, observable, runInAction } from 'mobx';

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

  update = async () => {
    let imagePath = null;
    let publicUrl = null;

    if (author.photo && values.photo) {
      const imageNameString = author.photo.split('/');

      const photoRemove = await supabase.storage
        .from('authors')
        .remove([imageNameString.slice(-1)[0]]);

      const fileName = values.photo?.name
        ? values.photo?.name
        : 'failNameString';

      const photoUdate = await supabase.storage
        .from('authors')
        .upload(`author_${fileName}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });

      imagePath = photoUdate.data?.path;
    }

    if (!author.photo && values.photo) {
      const photoUpload = await supabase.storage
        .from('authors')
        .upload(`author_${values.photo.name}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });
      imagePath = photoUpload.data?.path;
    }

    if (author.photo && !values.photo) {
      imagePath = author.photo;
      publicUrl = author.photo;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('authors').getPublicUrl(imagePath)
        .data.publicUrl);

    const { data, error } = await supabase
      .from('Authors')
      .update({
        birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
        death_date: values.deathDate ? values.deathDate.toUTCString() : null,
        phrase: values.phrase,
        photo: publicUrl,
        city: values.city,
        bio: values.bio,
      })
      .eq('id', author.id)
      .select('*')
      .single();
  };

  destroy(): void {
    return;
  }
}

export default AuthorStore;
