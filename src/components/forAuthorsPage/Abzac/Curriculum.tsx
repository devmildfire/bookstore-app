import { staff, Teacher } from './Staf';

export interface Course {
  readonly title: string;
  readonly about?: string;
  readonly lector: Teacher | undefined;
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
  },
  {
    title: 'Инди-книгоиздание',
    about: 'Древнее искусство в современности',
    lector: findTeacher('Дедович'),
  },
  {
    title: 'Продюсирование и управление творческими проектами',
    lector: findTeacher('Дедович'),
  },
  {
    title: 'Создание бренда для личностей и компаний',
    lector: findTeacher('Дедович'),
  },
  {
    title: 'Классическое стихосложение и верлибристика',
    lector: findTeacher('Арчет'),
  },
  {
    title: 'Журналистика и расследования',
    lector: findTeacher('Арчет'),
  },
  {
    title: 'Литература на грани — словесность в контексте медиа',
    about: 'Словесность в контексте медиа',
    lector: findTeacher('Янкус'),
  },
];

export { curriculum };
