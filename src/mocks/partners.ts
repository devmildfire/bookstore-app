import { Partner } from '@/types/partner';
import readCafePhoto from '../../public/images/partners/read-cafe.webp';
import logo451 from '../../public/images/partners/451.png';
import poryadokSlov from '../../public/images/partners/poryadok-slov.png';

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
  },
  {
    id: 2,
    name: 'Порядок Слов',
    photo: poryadokSlov.src,
  },
];

export default partners;
