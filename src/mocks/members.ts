import { Member } from '@/types/member';
import alenaPhoto from '../../public/images/members/alena-kupchinskay.webp';
import dedovichPhoto from '../../public/images/members/sergey-dedovich.png';
import yankusPhoto from '../../public/images/members/andrey-yankus.png';
import vidyaskinaPhoto from '../../public/images/members/katerina-vidyaskina.png';
import kurnosovaPhoto from '../../public/images/members/ekaterina-kurnosova.png';
import kovalevskayaPhoto from '../../public/images/members/ekaterina-kovalevskaya.png';
import malcevaPhoto from '../../public/images/members/anastasiya-malceva.png';
import ploskonosPhoto from '../../public/images/members/veronika-ploskonos.png';
import gilmanovaPhoto from '../../public/images/members/gilmanova-diana.png';
import grebenschikovaPhoto from '../../public/images/members/grebenschikova-ekaterina.png';
import kapustyakPhoto from '../../public/images/members/aleksei-kapustyak.png';

const members: Member[] = [
  {
    id: 0,
    member: 'Алёна Купчинская',
    position: 'ведущий редактор',
    city: 'г. Москва',
    photo: alenaPhoto.src,
    phrase:
      '«В наших силах искать литературные бриллианты, чтобы передать их детям как семейную драгоценность».',
  },
  {
    id: 1,
    member: 'Андрей Янкус',
    position: 'главный редактор',
    city: 'г. Санкт-Петербург',
    photo: yankusPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 2,
    member: 'Сергей Дедович',
    position: 'шеф-редактор',
    city: 'г. Санкт-Петербург',
    photo: dedovichPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 3,
    member: 'Катерина Видяскина',
    position: 'ведущий дизайнер',
    city: 'г. Санкт-Петербург',
    photo: vidyaskinaPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 4,
    member: 'Екатерина Курносова',
    position: 'иллюстратор',
    city: 'г. ???',
    photo: kurnosovaPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 5,
    member: 'Екатерина Ковалевская',
    position: 'иллюстратор',
    city: 'г. Нижний Новгород',
    photo: kovalevskayaPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 6,
    member: 'Анастасия Мальцева',
    position: 'режиссёр буктрейлеров',
    city: 'г. Санкт-Петербург',
    photo: malcevaPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 7,
    member: 'Вероника Плосконос',
    position: 'художник анимации',
    city: 'г. ???',
    photo: ploskonosPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 8,
    member: 'Диана Гильманова',
    position: 'продюсер изданий',
    city: 'г. Екатеринбург',
    photo: gilmanovaPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 9,
    member: 'Екатерина Гребенщикова',
    position: 'корректор',
    city: 'г. ???',
    photo: grebenschikovaPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 10,
    member: 'Алексей Капустяк',
    position: 'верстальщик',
    city: 'г. Анна',
    photo: kapustyakPhoto.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
];

export default members;
