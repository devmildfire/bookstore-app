import {
  // AuthorServer,
  IAuthor,
  //  normalizeAuthor
} from '@/entities/author';
import { computed, makeObservable } from 'mobx';
// import { TitlePhotoModel } from '../TitlePhotoModel';
import {
  ITitle,
  ITitleAudiobook,
  // ITitleAuthor,
  ITitleAward,
  ITitleCardBook,
  ITitleEbook,
  ITitleNovel,
  ITitlePhoto,
  ITitlePrintedBook,
  // FullTitleNormalizedType,
  TitleServer,
  normalizeTitle,
} from '@/entities/title';
// import { BookTableTypesEnum } from '@/models/books';

class TitleModel {
  id: number;
  description: string;
  thesis: string;
  trailer: string;

  litForm: string;
  trailerPoster: string;
  isCompilation: boolean;

  ageRestriction: number;
  name: string;

  cover: string;
  coverBlurHash: string;

  slug: string;
  isFeatured: boolean;
  firstRelease: string;
  demo: string;
  authors: IAuthor[];
  Photos: ITitlePhoto[];
  cardBook: ITitleCardBook | null;
  audioBook: ITitleAudiobook | null;
  eBook: ITitleEbook | null;
  printedBook: ITitlePrintedBook | null;
  awards: ITitleAward[];
  novels: ITitleNovel[];

  constructor(data: ITitle) {
    this.id = data.id;
    this.name = data.name;

    this.description = data.description;
    this.thesis = data.thesis;

    this.litForm = data.litForm;
    this.trailerPoster = data.trailerPoster;
    this.isCompilation = data.isCompilation;

    this.trailer = data.trailer;
    this.ageRestriction = data.ageRestriction;
    this.cover = data.cover;
    this.coverBlurHash = data.coverBlurHash;

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

    this.novels = data.novels;

    // this.photo = new AuthorPhotoModel(data.photo);

    makeObservable<TitleModel>(this, {
      formData: computed,
    });
  }

  get formData() {
    return {
      id: this.id,
      name: this.name,

      description: this.description,
      thesis: this.thesis,
      trailer: this.trailer,

      litForm: this.litForm,
      trailerPoster: this.trailerPoster,
      isCompilation: this.isCompilation,

      ageRestriction: this.ageRestriction,

      cover: this.cover,
      coverBlurHash: this.coverBlurHash,

      slug: this.slug,
      isFeatured: this.isFeatured,
      firstRelease: this.firstRelease,
      demo: this.demo,
      authors: this.authors,
      Photos: this.Photos,
      cardBook: this.cardBook,
      audioBook: this.audioBook,
      eBook: this.eBook,
      printedBook: this.printedBook,
      awards: this.awards,
      novels: this.novels,
    };
  }

  static fromJson(data: TitleServer) {
    return new TitleModel(normalizeTitle(data));
  }
}

export default TitleModel;
