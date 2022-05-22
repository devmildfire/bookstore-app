import { Member } from '../types/member';
import alenaPhoto from '../../public/images/members/alena-kupchinskay.webp';
import nikolayPhoto from '../../public/images/members/nikolay-titov.webp';
import polinaPhoto from '../../public/images/members/polina-sharafutdinova.webp';

const members: Member[] = [
  {
    id: 0,
    member: 'Алёна Купчинская',
    position: 'редактор',
    city: 'г. Москва',
    photo: alenaPhoto.src,
    phrase:
      '«В наших силах искать литературные бриллианты, чтобы передать их детям как семейную драгоценность.»',
  },
  {
    id: 1,
    member: 'Николай Титов',
    position: 'администратор',
    city: 'г. Тамбов',
    photo: nikolayPhoto.src,
    phrase: '«Настоящую литературу делают бессовестные»',
  },
  {
    id: 2,
    member: 'Полина Шарафутдинова',
    position: 'редактор',
    city: 'г. Ижевск',
    photo: polinaPhoto.src,
    phrase:
      '«Если бы мне в какой-то миг была дана вечность, я бы без сомнения потратила её на книги»',
  },
  {
    id: 3,
    member: 'Алёна Купчинская',
    position: 'редактор',
    city: 'г. Москва',
    photo: alenaPhoto.src,
    phrase:
      '«В наших силах искать литературные бриллианты, чтобы передать их детям как семейную драгоценность.»',
  },
  {
    id: 4,
    member: 'Николай Титов',
    position: 'администратор',
    city: 'г. Тамбов',
    photo: nikolayPhoto.src,
    phrase: '«Настоящую литературу делают бессовестные»',
  },
  {
    id: 5,
    member: 'Полина Шарафутдинова',
    position: 'редактор',
    city: 'г. Ижевск',
    photo: polinaPhoto.src,
    phrase:
      '«Если бы мне в какой-то миг была дана вечность, я бы без сомнения потратила её на книги»',
  },
];

export default members;
