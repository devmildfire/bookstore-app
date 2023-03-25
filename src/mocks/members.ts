import { Member } from '@/types/member';
import alenaPhoto from '../../public/images/members/AlenaKupchinskaya.png';
import dedovichPhoto from '../../public/images/members/sergey-dedovich.png';
// import yankusPhoto from '../../public/images/members/andrey-yankus.png';
import vidyaskinaPhoto from '../../public/images/members/katerina-vidyaskina.png';
import kurnosovaPhoto from '../../public/images/members/ekaterina-kurnosova.png';
import kovalevskayaPhoto from '../../public/images/members/ekaterina-kovalevskaya.png';
import malcevaPhoto from '../../public/images/members/anastasiya-malceva.png';
import gilmanovaPhoto from '../../public/images/members/gilmanova-diana.png';
import grebenschikovaPhoto from '../../public/images/members/grebenschikova-ekaterina.png';
import kapustyakPhoto from '../../public/images/members/aleksei-kapustyak.png';
import AleksandraYasharkina from '../../public/images/members/AleksandraYasharkina.png';
import AlekseyBochkarev from '../../public/images/members/AlekseyBochkarev.png';
import LanaDorohova from '../../public/images/members/LanaDorohova.png';
import SofiaPopova from '../../public/images/members/SofiaPopova.png';
import MatveyDashiev from '../../public/images/members/MatveyDashiev.png';
import DaniilNecheev from '../../public/images/members/DaniilNecheev.png';
import AnastasiyaVinichenko from '../../public/images/members/AnastasiyaVinichenko.png';
import IlyaCherkasov from '../../public/images/members/IlyaCherkasov.png';
import SvetlanaSharonova from '../../public/images/members/SvetlanaSharonova.png';
import IgorKozyrev from '../../public/images/members/IgorKozyrev.png';
import VsevolodDorohov from '../../public/images/members/VsevolodDorohov.png';
import Gorynych from '../../public/images/members/Gorynych.png';
import ArsibekovaValeria from '../../public/images/members/ArsibekovaValeria.png';
import AnnaMezenceva from '../../public/images/members/AnnaMezenceva.png';
import AnnaVolcova from '../../public/images/members/AnnaVolcova.png';
import PavelTrufanov from '../../public/images/members/PavelTrufanov.png';
import LubovNevskaya from '../../public/images/members/LubovNevskaya.png';
import KitillGorbachevskiy from '../../public/images/members/KitillGorbachevskiy.png';
import KseniaHarina from '../../public/images/members/KseniaHarina.png';
import DaniilRumancev from '../../public/images/members/DaniilRumancev.png';
import AnnaDostieva from '../../public/images/members/AnnaDostieva.png';
import ArtemNovoselov from '../../public/images/members/ArtemNovoselov.png';
// import NikilaiJeltuhin from '../../public/images/members/NikilaiJeltuhin.png';
import LenaSolnceva from '../../public/images/members/LenaSolnceva.png';

const members: Member[] = [
  {
    // id: 0,
    member: 'Алёна Купчинская',
    position: 'ведущий редактор',
    city: 'г. Москва',
    photo: alenaPhoto.src,
    phrase: '«Литература — это вера в любовь между рацио и эмоцио»',
  },
  // {
  //   member: 'Андрей Янкус',
  //   position: 'шеф-редактор Чтива',
  //   city: 'Эльдорадо',
  //   photo: yankusPhoto.src,
  //   phrase:
  //    '«Писатель как тот, кто видит и слышит, — вот цель литературы: переход
  //  жизни в язык, который учреждает Идеи»',
  // },
  {
    // id: 2,
    member: 'Сергей Дедович',
    position: 'шеф-редактор',
    city: 'г. Санкт-Петербург',
    photo: dedovichPhoto.src,
    phrase:
      '«Книгоиздание не должно быть бизнесом, чтобы писатель был властителем дум, а не удовлетворителем потребительского спроса»',
  },
  {
    // id: 3,
    member: 'Катерина Видяскина',
    position: 'ведущий дизайнер',
    city: 'г. Санкт-Петербург',
    photo: vidyaskinaPhoto.src,
    phrase: '???',
  },
  {
    // id: 4,
    member: 'Екатерина Курносова',
    position: 'иллюстратор',
    city: 'г. ???',
    photo: kurnosovaPhoto.src,
    phrase: '???',
  },
  {
    // id: 5,
    member: 'Екатерина Ковалевская',
    position: 'иллюстратор',
    city: 'г. Нижний Новгород',
    photo: kovalevskayaPhoto.src,
    phrase: '???',
  },
  {
    // id: 6,
    member: 'Анастасия Мальцева',
    position: 'режиссёр буктрейлеров',
    city: 'г. Санкт-Петербург',
    photo: malcevaPhoto.src,
    phrase:
      '«По словам Чарльза Олсена, лучашя поэзия — это своего рода шизофрения»',
  },
  {
    // id: 7,
    member: 'Диана Гильманова',
    position: 'продюсер изданий',
    city: 'г. Екатеринбург',
    photo: gilmanovaPhoto.src,
    phrase: '???',
  },
  {
    // id: 8,
    member: 'Екатерина Гребенщикова',
    position: 'корректор',
    city: 'г. Белград',
    photo: grebenschikovaPhoto.src,
    phrase: '???',
  },
  {
    // id: 9,
    member: 'Алексей Капустяк',
    position: 'верстальщик',
    city: 'г. Анна',
    photo: kapustyakPhoto.src,
    phrase: '???',
  },

  {
    // id: 10,
    member: 'Александра Яшаркина',
    position: 'ведущий верстальщик',
    city: 'г. Ярославль',
    photo: AleksandraYasharkina.src,
    phrase: '«Найди слово, которое любишь, и позволь ему убить себя»',
  },
  {
    // id: 11,
    member: 'Алексей Бочкарёв',
    position: 'художник анимации',
    city: 'г. Томск',
    photo: AlekseyBochkarev.src,
    phrase: '???',
  },
  {
    // id: 12,
    member: 'Лана Дорохова',
    position: 'специалист отдела развития',
    city: 'г. Ереван',
    photo: LanaDorohova.src,
    phrase:
      '«Мне кажется, Пелевин жёлтого цвета, Толстой светло-коричневый, Достоевский тёмно-зелёный, Бунин как рябина, Набоков светло-голубой»',
  },
  {
    // id: 13,
    member: 'Софья Попова',
    position: 'редактор',
    city: 'город',
    photo: SofiaPopova.src,
    phrase: '???',
  },
  {
    // id: 14,
    member: 'Матвей Дашиев',
    position: 'специалист по развитию',
    city: 'г. Санкт-Петербург',
    photo: MatveyDashiev.src,
    phrase: '???',
  },

  {
    // id: 15,
    member: 'Даниил Нечеев',
    position: 'руководитель видеоотдела',
    city: 'г. Ереван',
    photo: DaniilNecheev.src,
    phrase: '???',
  },

  {
    // id: 16,
    member: 'Анастасия Виниченко',
    position: 'графический дизайнер',
    city: 'г. Калининград',
    photo: AnastasiyaVinichenko.src,
    phrase: '???',
  },

  {
    // id: 17,
    member: 'Илья Черкасов',
    position: 'веб-дизайнер',
    city: 'г. Санкт-Петербург',
    photo: IlyaCherkasov.src,
    phrase: '???',
  },
  {
    // id: 18,
    member: 'Светлана Шаронова',
    position: 'СММ',
    city: 'г. Москва',
    photo: SvetlanaSharonova.src,
    phrase: '???',
  },
  {
    // id: 19,
    member: 'Игорь Козырев',
    position: 'иллюстратор',
    city: 'г. Ростов-на-Дону',
    photo: IgorKozyrev.src,
    phrase: '???',
  },
  {
    // id: 20,
    member: 'Всеволод Дорохов',
    position: 'звукорежиссёр',
    city: 'г. Ереван',
    photo: VsevolodDorohov.src,
    phrase: '???',
  },
  {
    // id: 21,
    member: 'Горыныч',
    position: 'иллюстратор',
    city: 'Кудыкина Гора',
    photo: Gorynych.src,
    phrase: '«Ты не Курт Воннегут!» ARS LONGA, VITA BREVIS',
  },
  {
    // id: 22,
    member: 'Валерия Арсибекова',
    position: 'специалист по развитию',
    city: 'г. Санкт-Петербург',
    photo: ArsibekovaValeria.src,
    phrase: '???',
  },
  {
    // id: 23,
    member: 'Анна Мезенцева',
    position: 'корректор',
    city: 'г. Москва',
    photo: AnnaMezenceva.src,
    phrase: '???',
  },

  {
    // id: 24,
    member: 'Анна Волкова',
    position: 'редактор',
    city: 'г. Калуга',
    photo: AnnaVolcova.src,
    phrase: '???',
  },

  {
    // id: 25,
    member: 'Павел Труфанов',
    position: 'художник анимации',
    city: 'г. ???',
    photo: PavelTrufanov.src,
    phrase: '???',
  },

  {
    // id: 26,
    member: 'Любовь Невская',
    position: 'оператор-постановщик буктрейлеров',
    city: 'г. Санкт-Петербург',
    photo: LubovNevskaya.src,
    phrase: '???',
  },

  {
    // id: 27,
    member: 'Кирилл Горбачевский',
    position: 'верстальщик',
    city: 'г. Томск',
    photo: KitillGorbachevskiy.src,
    phrase: '???',
  },

  {
    // id: 28,
    member: 'Ксения Харина',
    position: 'иллюстратор',
    city: 'г. ???',
    photo: KseniaHarina.src,
    phrase: '???',
  },

  {
    // id: 29,
    member: 'Даниил Румянцев',
    position: 'дизайнер',
    city: 'г. Санкт-Петербург',
    photo: DaniilRumancev.src,
    phrase: '«Ума палата дороже злата»',
  },

  {
    // id: 30,
    member: 'Анастасия Достиева',
    position: 'специалист по развитию',
    city: 'г. Санкт-Петербург',
    photo: AnnaDostieva.src,
    phrase: '???',
  },
  {
    // id: 31,
    member: 'Артём Новосёлов',
    position: 'веб-разработчик',
    city: 'г. Пермь',
    photo: ArtemNovoselov.src,
    phrase:
      '«Хорошая книжка как хорошая гантель — не вдруг и осилишь, но прокачивает серьёзно»',
  },
  // {
  //   // id: 32,
  //   member: 'Николай Желтухин',
  //   position: 'звукорежиссёр',
  //   city: 'г. Ереван',
  //   photo: NikilaiJeltuhin.src,
  //   phrase: '«Прощай, цыганка Сэра»',
  // },
  {
    // id: 504,
    member: 'Лена Солнцева',
    position: 'иллюстратор',
    city: 'г. Казань',
    photo: LenaSolnceva.src,
    phrase: '???',
  },
];

export default members;
