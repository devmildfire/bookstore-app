import { Subscription } from '@/models/subscription';

const subscriptions: Subscription[] = [
  {
    id: 1,
    price: 150,
    title: 'БЛИЗОСТИ',
    features: ['Цифровые издания в день релиза', 'Аудиоиздания в день релиза'],
  },
  {
    id: 2,
    price: 300,
    title: 'ПРИЧАСТИЯ',
    features: [
      'Цифровые издания в день релиза',
      'Аудиоиздания в день релиза',
      'Классика Чтива раз в месяц',
    ],
  },
  {
    id: 3,
    price: 1000,
    title: 'ЕДИНСТВА',
    features: [
      'Цифровые издания в день релиза',
      'Аудиоиздания в день релиза',
      'Классика Чтива раз в месяц',
      'Печатные издания в день релиза',
    ],
  },
];

export default subscriptions;
