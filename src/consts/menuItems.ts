export type SubmenuItem = {
  subtitle: string
  link?: string
  items?: {
    title: string
    link: string
  }[]
}

export type MenuItem = {
  title: string
  link?: string
  submenu?: SubmenuItem[]
}

const forReaders: SubmenuItem[] = [
  {
    subtitle: 'Книжная лавка',
    items: [
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
]

const forAuthors: SubmenuItem[] = [
  {
    subtitle: 'Предложить рукопись Чтиву',
    link: '/suggest-manuscript',
  },
  {
    subtitle: 'Предложить рассказ\nв журнал Русского Динозавра',
    link: '/suggest-story-to-rd',
  },
  {
    subtitle: 'Мастерская Абзац',
    link: '/abzac',
  },
]

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
    link: '/investors',
  },
  {
    title: 'Контакты',
    link: '/contacts',
  },
]

export default menu
