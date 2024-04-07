import { supabase } from 'api/supabase-client/client';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { toast } from 'sonner';

export default class AuthorPhotoModel {
  prevSrc: string | null;
  src: string | null = null;
  file: File | null = null;

  constructor(src: string | null) {
    makeObservable(this, {
      prevSrc: observable,
      src: observable,
      file: observable,
      upload: action,
      select: action,
      reset: action,
    });

    this.src = src;
    this.prevSrc = src;
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

    const { data } = supabase.storage
      .from('authors')
      .getPublicUrl(photo.data.path);

    runInAction(() => {
      this.prevSrc = this.src;
      this.src = data.publicUrl;
    });
  };

  select = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files) {
      return;
    }

    runInAction(() => {
      this.file = files[0];
    });
  };

  reset = () => {
    this.file = null;
    this.src = this.prevSrc;
  };
}
