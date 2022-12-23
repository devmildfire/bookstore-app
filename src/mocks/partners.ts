import { Partner } from '@/types/partner';
import readCafePhoto from '../../public/images/partners/read-cafe.webp';
import logo451 from '../../public/images/partners/451.png';
import poryadokSlov from '../../public/images/partners/poryadok-slov.png';
import ahuli from '../../public/images/partners/ahuli.png';
import discourse from '../../public/images/partners/discourse.png';
import smena from '../../public/images/partners/smena.png';
import subscriptions from '../../public/images/partners/subscriptions.png';
import flophouse from '../../public/images/partners/flophouse.png';
import falanster from '../../public/images/partners/falanster.png';
import callme from '../../public/images/partners/callme.png';
import literatureyear from '../../public/images/partners/literatureyear.png';
import liferoad from '../../public/images/partners/liferoad.png';
import bookspresents from '../../public/images/partners/bookspresents.png';
import factotum from '../../public/images/partners/factotum.png';

const partners: Partner[] = [
  {
    id: 0,
    name: 'ReadCafe',
    photo: readCafePhoto.src,
  },
  {
    id: 1,
    name: '451',
    photo: logo451.src,
    displayName: 'фаренгейт 451',
  },
  {
    id: 2,
    name: 'Порядок Слов',
    photo: poryadokSlov.src,
  },
  {
    id: 3,
    name: 'Ахули',
    photo: ahuli.src,
    displayName: 'Ахули',
  },
  {
    id: 4,
    name: 'Дискурс',
    photo: discourse.src,
    displayName: 'Дискурс',
  },
  {
    id: 5,
    name: 'Смена',
    photo: smena.src,
  },
  {
    id: 6,
    name: 'Подписные издания',
    photo: subscriptions.src,
  },
  {
    id: 7,
    name: 'Ночлежка',
    photo: flophouse.src,
  },
  {
    id: 8,
    name: 'Фаланстер',
    photo: falanster.src,
  },
  {
    id: 9,
    name: 'Колми',
    photo: callme.src,
    displayName: 'Колми',
  },
  {
    id: 10,
    name: 'Год литературы',
    photo: literatureyear.src,
    displayName: 'Год литературы',
  },
  {
    id: 11,
    name: 'Дорога жизни',
    photo: liferoad.src,
  },
  {
    id: 12,
    name: 'Книгиподарки',
    photo: bookspresents.src,
  },
  {
    id: 13,
    name: 'Фактотум',
    photo: factotum.src,
    displayName: 'Фактотум',
  },
];

export default partners;
