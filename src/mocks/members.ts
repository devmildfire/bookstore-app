import { Member } from '@/types/member';
import alenaPhoto from '../../public/images/members/AlenaKupchinskaya.png';
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
import AkeksandraYasharkina from '../../public/images/members/AkeksandraYasharkina.png';
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
import NikilaiJeltuhin from '../../public/images/members/NikilaiJeltuhin.png';
// import  from '../../public/images/members/.png';
// import  from '../../public/images/members/.png';
// import  from '../../public/images/members/.png';
// import  from '../../public/images/members/.png';
// import  from '../../public/images/members/.png';

const members: Member[] = [
  {
    id: 0,
    member: 'Алёна Купчинская',
    position: 'ведущий редактор',
    city: 'г. Москва',
    photo: alenaPhoto.src,
    phrase: '«Каждому стоит сначала найти путь к себе, а уже потом к другому»',
  },
  {
    id: 1,
    member: 'Андрей Янкус',
    position: 'шеф-редактор Чтива',
    city: 'Эльдорадо',
    photo: yankusPhoto.src,
    phrase:
      '«Переключить на чёрно-белый режим и убивать убивать убивать убивать убивать убивать убивать»',
  },
  {
    id: 2,
    member: 'Сергей Дедович',
    position: 'шеф-редактор РД',
    city: 'г. Санкт-Петербург',
    photo: dedovichPhoto.src,
    phrase:
      '«Книгоиздание не должно быть бизнесом, чтобы писатель был властителем дум, а не удовлетворителем потребительского спроса»',
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
    phrase: '«В этом мире жить невозможно, но больше негде» Джек Керуак',
  },

  {
    id: 13,
    member: 'Александра Яшаркина',
    position: 'ведущий верстальщик',
    city: 'город',
    photo: AkeksandraYasharkina.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 14,
    member: 'Алексей Бочкарёв',
    position: 'художник анимации',
    city: 'г. Томск',
    photo: AlekseyBochkarev.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 15,
    member: 'Лана Дорохова',
    position: 'ведущая радио Овердрайв',
    city: 'г. Ереван',
    photo: LanaDorohova.src,
    phrase: '«Вадимчик выпил и опять загрустил».',
  },
  {
    id: 16,
    member: 'Софья Попова',
    position: 'редактор',
    city: 'город',
    photo: SofiaPopova.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 17,
    member: 'Матвей Дашиев',
    position: 'специалист по развитию',
    city: 'г. Санкт-Петербург',
    photo: MatveyDashiev.src,
    phrase: '«Не роняйте детей!»',
  },

  {
    id: 18,
    member: 'Даниил Нечеев',
    position: 'руководитель видеоотдела',
    city: 'город',
    photo: DaniilNecheev.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 19,
    member: 'Анастасия Виниченко',
    position: 'графический Дизайнер',
    city: 'г. Калининград',
    photo: AnastasiyaVinichenko.src,
    phrase:
      '«Я думаю, что задача дизайнера-пытаться сломать правила и границы» Джанни Версаче',
  },

  {
    id: 20,
    member: 'Илья Черкасов',
    position: 'веб-дизайнер',
    city: 'г. Санкт-Петербург',
    photo: IlyaCherkasov.src,
    phrase: '«Самоуничижение – форма гордыни»',
  },
  {
    id: 21,
    member: 'Светлана Шаронова',
    position: 'СММ',
    city: 'г. Москва',
    photo: SvetlanaSharonova.src,
    phrase:
      '«Вечер показывал язык нам в окно, а мы, как всех учили ещё в детском саду, не обращали на дурака внимания»',
  },

  {
    id: 22,
    member: 'Игорь Козырев',
    position: 'иллюстратор',
    city: 'г. Ростов-на-Дону',
    photo: IgorKozyrev.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 23,
    member: 'Всеволод Дорохов',
    position: 'звукорежиссёр',
    city: 'г. Ереван',
    photo: VsevolodDorohov.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },
  {
    id: 24,
    member: 'Горыныч',
    position: 'иллюстратор',
    city: 'Кудыкина Гора',
    photo: Gorynych.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 25,
    member: 'Валерия Арсибекова',
    position: 'специалист по развитию',
    city: 'город',
    photo: ArsibekovaValeria.src,
    phrase: '«Я не буду менять линолеум, я передумал, ибо мир обречен»',
  },

  {
    id: 26,
    member: 'Анна Мезенцева',
    position: 'корректор',
    city: 'г. Москва',
    photo: AnnaMezenceva.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 27,
    member: 'Анна Волкова',
    position: 'редактор',
    city: 'г. Калуга',
    photo: AnnaVolcova.src,
    phrase:
      '«Та парусная лодка, которую он заметил, удалялась всё дальше и дальше, словно детская сказка во взрослых воспоминаниях. Он знал, что вскоре она станет точкой этой сказки, а потом — сбывшимся желанием»',
  },

  {
    id: 28,
    member: 'Павел Труфанов',
    position: 'художник анимации',
    city: 'город',
    photo: PavelTrufanov.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 29,
    member: 'Любовь Невская',
    position: 'кинооператор',
    city: 'г. Санкт-Петербург',
    photo: LubovNevskaya.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 30,
    member: 'Кирилл Горбачевский',
    position: 'верстальщик',
    city: 'г. Томск',
    photo: KitillGorbachevskiy.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 31,
    member: 'Ксения Харина',
    position: 'иллюстратор',
    city: 'город',
    photo: KseniaHarina.src,
    phrase:
      'Циатата 80% насыщенности, допустим, что она помещается в четыре или пять строк, а может шесть.',
  },

  {
    id: 32,
    member: 'Даниил Румянцев',
    position: 'дизайнер',
    city: 'г. Санкт-Петербург',
    photo: DaniilRumancev.src,
    phrase: '«Ума палата дороже злата»',
  },

  {
    id: 33,
    member: 'Анастасия Достиева',
    position: 'специалист по развитию',
    city: 'город',
    photo: AnnaDostieva.src,
    phrase:
      '«Как бы тонко и любовно ни анализировали и ни разъясняли рассказ, всегда найдется ум, оставшийся безучастным, и спина, по которой не пробежит холодок»',
  },

  {
    id: 34,
    member: 'Артём Новосёлов',
    position: 'веб-разработчик',
    city: 'г. Пермь',
    photo: ArtemNovoselov.src,
    phrase: '«Люди кропают идеи, идеи вращают мир»',
  },
  {
    id: 35,
    member: 'Николай Желтухин',
    position: 'звукорежиссёр',
    city: 'г. Ереван',
    photo: NikilaiJeltuhin.src,
    phrase: '«Прощай, цыганка Сэра»',
  },
];

export default members;
