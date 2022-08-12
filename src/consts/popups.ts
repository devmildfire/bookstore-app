export interface Popups {
  readonly addBasketBook: string;
}

export const POPUPS: Popups = {
  addBasketBook: 'abb',
};

export type PopupKeys = keyof Popups;
