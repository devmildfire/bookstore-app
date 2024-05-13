import { TitlePreview } from '@/entities/title/server';

class TitlePreviewModel {
  id: number;
  name: string;
  cover: string | null;

  constructor(data: TitlePreview) {
    this.id = data.id;

    this.name = data.name;
    this.cover = data.cover;
  }

  static fromJson(data: TitlePreview) {
    return new TitlePreviewModel(data);
  }
}

export default TitlePreviewModel;
