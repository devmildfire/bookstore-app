import { Subscription } from '@/models/subscriptions';

const subscriptions: Subscription[] = [
  {
    id: 1,
    image: '/images/subscriptions/closeness.webp',
    price: 150,
    title: 'БЛИЗОСТИ',
    features: ['Цифровые издания в день релиза', 'Аудиоиздания в день релиза'],
  },
  {
    id: 2,
    image: '/images/subscriptions/participle.webp',
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
    image: '/images/subscriptions/unity.webp',
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
