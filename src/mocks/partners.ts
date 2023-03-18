import { Partner } from '@/types/partner';
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
    name: '451',
    photo: logo451.src,
    displayName: 'фаренгейт 451',
  },
  {
    id: 1,
    name: 'Порядок Слов',
    photo: poryadokSlov.src,
  },
  {
    id: 2,
    name: 'Ахули',
    photo: ahuli.src,
    displayName: 'Ахули',
  },
  {
    id: 3,
    name: 'Дискурс',
    photo: discourse.src,
    displayName: 'Дискурс',
  },
  {
    id: 4,
    name: 'Смена',
    photo: smena.src,
  },
  {
    id: 5,
    name: 'Подписные издания',
    photo: subscriptions.src,
  },
  {
    id: 6,
    name: 'Ночлежка',
    photo: flophouse.src,
  },
  {
    id: 7,
    name: 'Фаланстер',
    photo: falanster.src,
  },
  {
    id: 8,
    name: 'Колми',
    photo: callme.src,
    displayName: 'Колми',
  },
  {
    id: 9,
    name: 'Год литературы',
    photo: literatureyear.src,
    displayName: 'Год литературы',
  },
  {
    id: 10,
    name: 'Дорога жизни',
    photo: liferoad.src,
  },
  {
    id: 11,
    name: 'Книгиподарки',
    photo: bookspresents.src,
  },
  {
    id: 12,
    name: 'Фактотум',
    photo: factotum.src,
    displayName: 'Фактотум',
  },
];

// const partnersWID = setUUIDField(partners);

export default partners;
