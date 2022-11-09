import { Book, BookType, Reader, Worker } from '@/models/books';
import getRandomBetween from '@/utils/getRandomBetween';
import { authors } from './authors';

const readers: Reader[] = [
  {
    name: 'eBoox',
    markets: [
      {
        name: 'Android',
        href: 'fakePath',
      },
      {
        name: 'iPhone',
        href: 'fakePath',
      },
    ],
  },
  {
    name: 'FBReader',
    markets: [
      {
        name: 'Android',
        href: 'fakePath',
      },
      {
        name: 'iPhone',
        href: 'fakePath',
      },
    ],
  },
  {
    name: 'KyBooks',
    markets: [
      {
        name: 'iPhone',
        href: 'fakePath',
      },
    ],
  },
];

const workers: Worker[] = [
  {
    place: 'редактор',
    fullName: 'Наталья Кислова',
  },
  {
    place: 'веб-мастер',
    fullName: 'Серафим Лоза',
  },
  {
    place: 'дизайнер',
    fullName: 'Екатерина Яковлева',
  },
  {
    place: 'верстальщик',
    fullName: 'Леон Меликьянц',
  },
  {
    place: 'иллюстратор',
    fullName: 'Евгений Борщевский',
  },
];

const formats: string[] = ['Fb2', 'Epub'];

const publishDate = [
  '2021-01-01',
  '2020-01-01',
  '2019-01-01',
  '2018-01-01',
  '2017-01-01',
];

const types: BookType[] = ['audio', 'digital', 'write', 'book2'];

const book: Book = {
  id: 2,
  title: 'DELETED',
  transliteratedTitle: 'deleted',
  authors: [authors[3]],
  publishDate: '2021-12-12',
  genre: 'роман',
  ageRestriction: '18+',
  price: 300,
  thesis: 'Если Вы не успели попрощатся с бабулей, мы передадим Ваше сообщение',
  newPrice: 350,
  image: '/images/book-covers/deleted.jpg',
  banner: 'https://via.placeholder.com/500x780?text=DELETED+хбдщдбдщ',
  trailerSrc: 'https://www.youtube.com/embed/RbE7vmnkWvU',
  description: [
    'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
    'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
    'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
  ],
  symbolCount: 355000,
  types,
  formats,
  readers,
  workers,
};

const books: Book[] = [
  {
    id: 1,
    title: 'Аристотель в Казахстане',
    transliteratedTitle: 'aristotel-v-kazahstane',
    authors: authors.slice(0, 2),
    publishDate: '2019-12-12',
    genre: 'роман',
    ageRestriction: '18+',
    price: 300,
    newPrice: null,
    image: '/images/bookTitleAristotle.jpg',
    banner:
      'https://via.placeholder.com/500x780?text=Аристотель+в+Казахстане+хбдщдбдщ',
    trailerSrc: './__mocks__/2022-07-06 12-28-28.webm',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 35500,
    types,
    formats,
    readers,
    workers,
  },
  {
    id: 2,
    title: 'DELETED',
    transliteratedTitle: 'deleted',
    authors: [authors[3]],
    publishDate: '2021-12-12',
    genre: 'роман',
    ageRestriction: '18+',
    price: 300,
    newPrice: 350,
    image: '/images/book-covers/deleted.jpg',
    banner: 'https://via.placeholder.com/500x780?text=DELETED+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/RbE7vmnkWvU',
    thesis:
      'Если Вы не успели попрощатся с бабулей, мы передадим Ваше сообщение',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 355000,
    types,
    formats,
    readers,
    workers,
  },
  {
    id: 3,
    title: 'КРАФТ',
    transliteratedTitle: 'craft',
    authors: [authors[4]],
    publishDate: '2021-12-12',
    genre: 'сборник повестей',
    ageRestriction: '18+',
    price: 300,
    newPrice: null,
    image: '/images/book-covers/craft.jpg',
    banner: 'https://via.placeholder.com/500x780?text=КРАФТ+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/6Wg-G_1bvi4',
    thesis: 'Любовь, смерть и каштаны',
    description: [
      `Две разных судьбы одного и того же человека пересекаются в одном микрорайоне. 
      Офисный сотрудник проводит жизнь в размышлениях о смерти, а порой ему кажется, что он уже мёртв. 
      Группа журналистов отправляется в пресс-тур в загадочный закрытый город; приехав на место, они понимают, что тур заказан только в один конец. 
      Георгий Панкратов мастерски сплетает современные реалии с мирозданческими материями и экзистенциальными ужасами, 
      способными привести в трепет даже самого бывалого читателя. Встречайте новые истории от автора «Российского времени».`,
      `Автор о книге: «На какие-то моменты современная литература обращает мало внимания, 
      и хочу, чтобы они были представлены и услышаны. Меня волнуют несправедливость, сложности взаимопонимания между людьми, 
      поиск счастья, который порою приводит их на достаточно странные территории, подталкивает к спорным решениям». `,
    ],
    symbolCount: 530000,
    types,
    formats,
    readers,
    workers,
  },
];

export const generateBook = (id: number): Book => ({
  ...book,
  id,
  publishDate: publishDate[getRandomBetween(0, publishDate.length)],
});

export default books;
