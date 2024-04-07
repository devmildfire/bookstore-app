import {
  Home,
  LineChart,
  Package,
  Settings,
  ShoppingCart,
  Users2,
} from 'lucide-react';

// TODO: вынести в общий конфиг для мобильной и десктопной навигации
export const sidebarConfig = [
  {
    href: '/admin',
    text: 'Dashboard',
    tooltipText: 'Панель управления',
    Icon: Home,
  },
  // { href: '#', text: 'Orders', tooltipText: 'Orders', Icon: ShoppingCart },
  {
    href: '/admin/products',
    text: 'Товары',
    tooltipText: 'Товары',
    Icon: Package,
  },
  {
    href: '/admin/authors',
    text: 'Авторы',
    tooltipText: 'Авторы',
    Icon: Users2,
  },
  // { href: '#', text: 'Analytics', tooltipText: 'Analytics', Icon: LineChart },
  // { href: '#', text: 'Settings', tooltipText: 'Settings', Icon: Settings },
];
