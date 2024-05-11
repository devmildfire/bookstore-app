import { AuthorServer, IAuthor, normalizeAuthor } from '@/entities/author';
import { computed, makeObservable } from 'mobx';
import { TitlePhotoModel } from '../TitlePhotoModel';
import {
  ITitle,
  ITitleAudiobook,
  ITitleAuthor,
  ITitleAward,
  ITitleCardBook,
  ITitleEbook,
  ITitlePhoto,
  ITitlePrintedBook,
  // FullTitleNormalizedType,
  TitleServer,
  normalizeTitle,
} from '@/entities/title';
import { BookTableTypesEnum } from '@/models/books';

class TitleModel {
  id: number;
  description: string;
  thesis: string;
  trailer: string;
  ageRestriction: number;
  name: string;
  cover: string;
  slug: string;
  isFeatured: boolean;
  firstRelease: string;
  demo: string;
  authors: ITitleAuthor[];
  Photos: ITitlePhoto[];
  cardBook: ITitleCardBook | null;
  audioBook: ITitleAudiobook | null;
  eBook: ITitleEbook; // электронное издание у книги всё равно есть, даже если никакого другого нет
  printedBook: ITitlePrintedBook | null;
  awards: ITitleAward[];

  prices: number[];
  discount: number[];
  types: BookTableTypesEnum[];

  constructor(data: ITitle) {
    this.id = data.id;
    this.name = data.name;

    this.description = data.description;
    this.thesis = data.thesis;
    this.trailer = data.trailer;
    this.ageRestriction = data.ageRestriction;
    this.cover = data.cover;
    this.slug = data.slug;
    this.isFeatured = data.isFeatured;
    this.firstRelease = data.firstRelease;
    this.demo = data.demo;

    //  FIXME для всего что не примитив нужно сделать модели, как у AuthorPhotoModel

    this.authors = data.authors;

    this.Photos = data.Photos;
    this.cardBook = data.cardBook;
    this.audioBook = data.audioBook;
    this.eBook = data.eBook;
    this.printedBook = data.printedBook;
    this.awards = data.awards;

    this.prices = data.prices;
    this.discount = data.discount;
    this.types = data.types;
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
