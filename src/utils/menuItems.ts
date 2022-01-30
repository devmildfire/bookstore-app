export type SubmenuItem = {
  subtitle: string,
  link?: string,
  items?:
    {
      title: string,
      link: string,
    }[]
}

export type MenuItem = {
  title: string,
  link?: string,
  submenu?: SubmenuItem[]
}

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
];

const forAuthors: SubmenuItem[] = [
  {
    subtitle: 'Предложить рукопись Чтиву',
    link: '/suggest-manuscript',
  },
  {
    subtitle: 'Предложить рассказ\nв журнал Русского Динозавра',
    link: '/suggest-story-to-rd',
  },
];

const menu: MenuItem[] = [
  {
    title: 'Главная',
    link: '/',
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
    title: 'Партнёрам',
    link: '/for-partners',
  },
  {
    title: 'О Чтиве',
    link: '/about',
  },
  {
    title: 'Контакты',
    link: '/contacts',
  },
];

export default menu;
