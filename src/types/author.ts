export interface Author {
  readonly id: number;
  readonly name: string;
  readonly photo: string | null;
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
