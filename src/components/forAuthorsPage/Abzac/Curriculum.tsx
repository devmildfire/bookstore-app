import { staff, Teacher } from './Staf';

export interface Course {
  readonly title: string;
  readonly about?: string;
  readonly lector: Teacher | undefined;
  readonly duration?: string;
  readonly format?: string;
  readonly price?: number;
}

const findTeacher = (tname: string): Teacher | undefined => {
  return staff.find((teacher) => {
    return teacher.name === tname;
  });
};

const curriculum: Course[] = [
  {
    title: 'Художественный текст',
    about: 'Написание и редактура',
    lector: findTeacher('Дедович'),
    duration: '4 часа',
    format: 'Видеолекция',
    price: 2000,
  },
  {
    title: 'Инди-книгоиздание',
    about: 'Древнее искусство в современности',
    lector: findTeacher('Дедович'),
    duration: '2 часа',
    format: 'Видеолекция',
    price: 1000,
  },
  {
    title: 'Продюсирование',
    about: 'арт-контент и управление творческими проектами',
    lector: findTeacher('Дедович'),
    duration: '2 часа',
    format: 'Видеолекция',
    price: 1000,
  },
  {
    title: 'Создание бренда для личностей и компаний',
    about: 'автор как единица и творческое объединение',
    lector: findTeacher('Дедович'),
    duration: '2 часа',
    format: 'Видеолекция',
    price: 1000,
  },
  {
    title: 'Cтихосложение',
    about: 'классические стихи и верлибристика',
    lector: findTeacher('Арчет'),
    duration: '4 часа',
    format: 'Видеолекция',
    price: 2000,
  },
  {
    title: 'Журналистика и расследования',
    about: 'работа с реальными историями',
    lector: findTeacher('Арчет'),
    duration: '4 часа',
    format: 'Видеолекция',
    price: 2000,
  },
  {
    title: 'Литература на грани',
    about: 'Словесность в контексте медиа',
    lector: findTeacher('Янкус'),
    duration: '4 часа',
    format: 'Видеолекция',
    price: 2000,
  },
];

export { curriculum };
