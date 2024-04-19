import { AuthorPreview, AuthorServer } from '@/entities/author';

class AuthorPreviewModel {
  id: number;
  bio: string | null;
  name: string;
  photo: string | null;

  constructor(data: AuthorPreview) {
    this.id = data.id;
    this.bio = data.bio;
    this.name = data.name;
    this.photo = data.photo;
  }

  static fromJson(data: AuthorPreview) {
    return new AuthorPreviewModel(data);
  }
}

export default AuthorPreviewModel;
