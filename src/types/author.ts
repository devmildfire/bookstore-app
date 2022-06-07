export interface Author {
  readonly id: string;
  readonly name: string;
  readonly photo: string;
  readonly phrase: string;
  readonly biography: string;
  readonly contacts: AuthorContact[];
}

export type AuthorContactType =
  | 'email'
  | 'vk'
  | 'instagram'
  | 'fb'
  | 'telegram';

export interface AuthorContact {
  readonly href: string;
  readonly type: AuthorContactType;
}
