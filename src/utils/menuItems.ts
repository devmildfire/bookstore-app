export type SubmenuItem = {
  subtitle: string;
  link: string;
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
    link: '/not-found',
  },
  {
    subtitle: 'Литжурнал РД',
    link: '/not-found',
  },
  {
    subtitle: 'Мейнстрим',
    link: '/not-found',
  },
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
    link: '/not-found',
  },
  {
    subtitle: 'Отправить рассказ для журнала',
    link: '/not-found',
  },
  {
    subtitle: 'Мастерская Абзац',
    link: '/not-found',
  },
];

const menu: MenuItem[] = [
  {
    title: 'О Чтиве',
    link: '/not-found',
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
    link: '/not-found',
  },
  // {
  //   title: 'Партнёрам',
  //   link: '/for-partners',
  // },
  {
    title: 'Контакты',
    link: '/not-found',
  },
];

const subMenu: MenuItem[] = [
  {
    title: 'ИЗДАНИЯ',
    link: '/not-found',
  },
  {
    title: 'БОКС-СЕТЫ',
    link: '/not-found',
  },
  {
    title: 'КАРТЫ ДАРОВ',
    link: '/not-found',
  },
  {
    title: 'ЧУДЕСА ПОДПИСКИ',
    link: '/not-found',
  },
];

export { menu, subMenu };
