// import { navItem } from '@/types/navItem';

interface NavItem {
  readonly title: string;
  readonly link: string;
}

const navItems: NavItem[] = [
  {
    title: 'Отправить рукопись',
    link: '/for-authors/send-manuscript',
  },
  {
    title: 'Литжурнал РД',
    link: '/for-authors/send-novel',
  },
  {
    title: 'Мастерская Абзац',
    link: '/for-authors/abzac',
  },
];

export default navItems;
