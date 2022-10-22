export type SubmenuItem = {
  subtitle: string;
  link?: string;
  items?: {
    title: string;
    link: string;
  }[];
};

export type MenuItem = {
  title: string;
  link?: string;
  submenu?: SubmenuItem[];
};

const forReaders: SubmenuItem[] = [
  {
    subtitle: 'Книжная лавка',
    items: [
      {
        title: 'Издания',
        link: '/books',
      },
      {
        title: 'Карты даров',
        link: '/gift-cards',
      },
      {
        title: 'Чудеса подписки',
        link: '/subscription',
      },
    ],
  },
  {
    subtitle: 'Журнал Русского Динозавра',
    link: '/dino-magazine',
  },
  // {
  //   subtitle: 'Журнал Русского Динозавра',
  //   link: '/dino-magazine',
  // },
  // {
  //   subtitle: 'Мейнстрим',
  //   link: '/mainstream',
  // },
];

// const forReaders: SubmenuItem[] = [
//   {
//     subtitle: 'Издания',
//     link: '/books',
//   },
//   {
//     subtitle: 'Карты даров',
//     link: '/gift-cards',
//   },
//   {
//     subtitle: 'Чудеса подписки',
//     link: '/subscription',
//   },
// ];

const forAuthors: SubmenuItem[] = [
  {
    subtitle: 'Отправить рукопись',
    link: '/suggest-manuscript',
  },
  {
    subtitle: 'Отправить рассказ для\u00A0журнала',
    link: '/suggest-story-to-rd',
  },
  {
    subtitle: 'Мастерская Абзац',
    link: '/abzac-workshop',
  },
];

const menu: MenuItem[] = [
  {
    title: 'О Чтиве',
    link: '/about',
  },
  {
    title: 'Чтецам',
    submenu: forReaders,
  },
  {
    title: 'Авторам',
    submenu: forAuthors,
  },
  {
    title: 'Инвесторам и донаторам',
    link: '/for-investors',
  },
  // {
  //   title: 'Партнёрам',
  //   link: '/for-partners',
  // },
  {
    title: 'Контакты',
    link: '/contacts',
  },
];

const subMenu: MenuItem[] = [
  {
    title: 'ИЗДАНИЯ',
    link: '/books',
  },
  {
    title: 'БОКС-СЕТЫ',
    link: '/box-sets',
  },
  {
    title: 'КАРТЫ ДАРОВ',
    link: '/gift-cards',
  },
  {
    title: 'ЧУДЕСА ПОДПИСКИ',
    link: '/subscription',
  },
];

export { menu, subMenu };
