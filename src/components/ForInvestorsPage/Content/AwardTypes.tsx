import esteem from '@/assets/icons/Star.svg';
import access from '@/assets/icons/digital.svg';
import books from '@/assets/icons/book.svg';

export interface Award {
  readonly name: string;
  readonly icon: SVGElement;
  readonly text: string;
}

const awardTypes: Award[] = [
  {
    name: 'Почёт',
    icon: esteem,
    text: 'Почёт, уважение, сотрудничество',
  },
  {
    name: 'Доступ',
    icon: access,
    text: 'Доступ к цифровой библиотеке Чтива',
  },
  {
    name: 'Книги',
    icon: books,
    text: 'Печатные новинки, созданные с вашей помощью',
  },
];

export { awardTypes };
