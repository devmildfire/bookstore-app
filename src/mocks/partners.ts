import { Partner } from '@/types/partner';
import readCafePhoto from '../../public/images/partners/read-cafe.webp';
import logo451 from '../../public/images/partners/451.png';
import poryadokSlov from '../../public/images/partners/poryadok-slov.png';
import ahuli from '../../public/images/partners/ahuli_2.png';
import discourse from '../../public/images/partners/discourse.png';
import smena from '../../public/images/partners/smena.png';

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
];

export default partners;
