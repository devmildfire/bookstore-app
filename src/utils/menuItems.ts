export type Submenu = [{
  subtitle: string,
  link?: string,
  items?: [
    {
      title: string,
      link: string,
    }
  ]
}]

export type MenuItem = {
  title: string,
  link: string,
  submenu?: Submenu
}

const books = [
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

const menu = [
  {
    title: 'Главная',
    link: '/',
  },
  {
    title: 'Чтецам',
    submenu: books,
  },
  {
    title: 'Авторам',
    submenu: '/for-authors',
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
