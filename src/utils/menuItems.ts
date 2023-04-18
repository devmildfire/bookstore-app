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
    link: '/for-authors/send-manuscript',
  },
  {
    subtitle: 'Отправить материал в литжурнал РД',
    link: '/for-authors/send-novel',
  },
  {
    subtitle: 'Мастерская Абзац',
    link: '/for-authors/abzac',
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
    link: '/not-found',
  },
  {
    title: 'Авторам',
    submenu: forAuthors,
    // link: '/for-authors',
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
