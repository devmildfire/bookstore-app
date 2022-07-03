import { Book, Reader, Worker } from '@/types/book';
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

const booksData: Book[] = [
  {
    id: '1',
    title: 'Аристотель в Казахстане',
    authors: authors.slice(0, 2),
    publishDate: '2019-12-12',
    genre: 'роман',
    ageRestriction: '18+',
    price: 300,
    newPrice: null,
    link: '/images/bookTitleAristotle.jpg',
    banner:
      'https://via.placeholder.com/1920x600?text=Аристотель+в+Казахстане+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/VR5WN4deUcU',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 35500,

    formats,
    readers,
    workers,
  },
  {
    id: '2',
    title: 'DELETED',
    authors: [authors[3]],
    publishDate: '2021-12-12',
    genre: 'роман',
    ageRestriction: '18+',
    price: 300,
    newPrice: 350,
    link: '/images/bookTitleDeleted.jpg',
    banner: 'https://via.placeholder.com/1920x600?text=DELETED+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/RbE7vmnkWvU',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 355000,
    formats,
    readers,
    workers,
  },
  {
    id: '3',
    title: 'КРАФТ',
    authors: [authors[4]],
    publishDate: '2021-12-12',
    genre: 'сборник повестей',
    ageRestriction: '18+',
    price: 300,
    newPrice: null,
    link: '/images/bookTitleCraft.jpg',
    banner: 'https://via.placeholder.com/1920x600?text=КРАФТ+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/6Wg-G_1bvi4',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 235500,
    formats,
    readers,
    workers,
  },
  {
    id: '4',
    title: 'Аристотель в Казахстане',
    authors: authors.slice(0, 2),
    publishDate: '2019-12-12',
    genre: 'роман',
    ageRestriction: '18+',
    price: 300,
    newPrice: null,
    link: '/images/bookTitleAristotle.jpg',
    banner:
      'https://via.placeholder.com/1920x600?text=Аристотель+в+Казахстане+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/VR5WN4deUcU',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 15000,
    formats,
    readers,
    workers,
  },
  {
    id: '5',
    title: 'DELETED',
    authors: [authors[3]],
    publishDate: '2021-12-12',
    genre: 'роман',
    ageRestriction: '18+',
    price: 300,
    newPrice: 350,
    link: '/images/bookTitleDeleted.jpg',
    banner: 'https://via.placeholder.com/1920x600?text=DELETED+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/RbE7vmnkWvU',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 15264,
    formats,
    readers,
    workers,
  },
  {
    id: '6',
    title: 'КРАФТ',
    authors: [authors[4]],
    publishDate: '2021-12-12',
    genre: 'сборник повестей',
    ageRestriction: '18+',
    price: 300,
    newPrice: null,
    link: '/images/bookTitleCraft.jpg',
    banner: 'https://via.placeholder.com/1920x600?text=КРАФТ+хбдщдбдщ',
    trailerSrc: 'https://www.youtube.com/embed/6Wg-G_1bvi4',
    description: [
      'Стася работает бардонавткой, кем-то вроде почтальона между   нашим миром и Бардо — так учёные назвали случайно открытое измерение, куда на некоторое время после смерти попадает сознание умерших людей.',
      'Стася хорошо себя чувствует среди мёртвых, а вот в мире живых у неё полно проблем: письма и слежка бывшего парня, постоянные разговоры отца о её никчёмности…',
      'Но всего этого как будто недостаточно, и в её жизни появляется ещё один преследователь — невидимый.',
    ],
    symbolCount: 1656541,
    formats,
    readers,
    workers,
  },
];

export default booksData;
