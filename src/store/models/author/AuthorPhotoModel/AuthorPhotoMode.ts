import { supabase } from 'api/supabase-client/client';
import { makeAutoObservable, runInAction } from 'mobx';
import { toast } from 'sonner';

export default class AuthorPhotoModel {
  src: string | null = null;
  file: File | null = null;

  constructor(src: string | null) {
    makeAutoObservable(this);

    this.src = src;
  }

  upload = async (pathname: string) => {
    if (!this.file) {
      return;
    }

    const photo = await supabase.storage
      .from('authors')
      .upload(`author_${pathname}`, this.file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (photo.error) {
      toast.error('Не удалось загрузить фото. Попытайтесь ещё раз');
    }

    if (!photo.data) {
      return;
    }

    runInAction(() => {
      this.src = photo.data.path;
    });
  };

  select = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files) {
      return;
    }

    this.file = files[0];
  };
}
