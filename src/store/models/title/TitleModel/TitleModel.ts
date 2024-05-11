import { AuthorServer, IAuthor, normalizeAuthor } from '@/entities/author';
import { computed, makeObservable } from 'mobx';
import { TitlePhotoModel } from '../TitlePhotoModel';
import {
  // FullTitleNormalizedType,
  TitleServer,
  normalizeTitle,
} from '@/entities/title';

class TitleModel {
  id: number;
  name: string;
  // bio: string | null;
  // city: string | null;
  // photo: AuthorPhotoModel;
  // phrase: string | null;
  // birthDate: string | null;
  // deathDate: string | null;

  // FIXME так как мы заранее не знаем какой будет тип у тайтлов на фронте
  // FIXME мы не можем типизировать конструктор класса TitleModel

  // constructor(data: IAuthor) {

  // constructor(data: any) {
  constructor(data: FullTitleNormalizedType) {
    this.id = data.id;
    this.name = data.name;
    // this.bio = data.bio;
    // this.city = data.city;
    // this.photo = new AuthorPhotoModel(data.photo);
    // this.phrase = data.phrase;
    // this.birthDate = data.birthDate;
    // this.deathDate = data.deathDate;

    makeObservable<TitleModel>(this, {
      formData: computed,
    });
  }

  get formData() {
    return {
      id: this.id,
      name: this.name,
      // bio: this.bio ? this.bio : undefined,
      // city: this.city ? this.city : undefined,
      // photo: this.photo ? this.photo : undefined,
      // phrase: this.phrase ? this.phrase : undefined,
      // birthDate: this.birthDate ? new Date(this.birthDate) : undefined,
      // deathDate: this.deathDate ? new Date(this.deathDate) : undefined,
    };
  }

  static fromJson(data: TitleServer) {
    return new TitleModel(normalizeTitle(data));
  }
}

export default TitleModel;
