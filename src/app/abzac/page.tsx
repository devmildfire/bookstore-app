import type { Metadata } from 'next'
import Image from 'next/image'
import AuthorsSidebar from '@/components/authors/AuthorsSidebar'
import AbzacEnrollButton from '@/components/authors/AbzacEnrollButton'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Мастерская Абзац',
  description:
    'Онлайн-мастерская «Абзац» — курс для авторов от арт-конгрегации «Русский Динозавр»: написание и редактура, инди-книгоиздание, журналистика, продюсирование и многое другое.',
}

const INTRO =
  'Огромная литературная семья, включающая в себя писателей, читателей, редакторов, корректоров, верстальщиков, издателей, критиков, иллюстраторов и многих других, продолжает существовать несмотря ни на что. Сколько бы ни применяли к ней цензурных кнутов, какими бы ни закармливали пряниками поп-культуры — задушить её пока не удалось никому. А чтобы этого никому не удалось и впредь, мы открываем мастерскую Абзац, призванную объединять любителей литературы и давать им новые знания, навыки, возможности, и, что важнее прочего, — друг друга.'

const TAIL =
  'Предварительная запись в онлайн-мастерскую уже открыта — от вас пока требуется только обозначить свой интерес. Вы получите все подробности непосредственно перед запуском курса, и тогда сможете решить, участвовать или нет.'

const TEACHERS = [
  {
    name: 'Арчет',
    photo: '/abzac/teacher-archet.webp',
    bio: 'Один из самых известных поэтов своего поколения: миллионы читателей, выступления на TEDx, фестивале ВК и Нашествии, выпустил несколько альбомов и книг. Журналист, редактор и корректор с многолетним опытом, обладатель множества премий (Журналистская премия «Вызов», лучший молодой журналист Северо-Запада России по версии Союза Журналистов Санкт-Петербурга, первое место на Bingowriters — глобальном писательском конкурсе от ВКонтакте, первая премия СПб за лучшую серию статей по теме «Толерантность», поэтическая премия «Послушайте» имени Хлебникова).',
  },
  {
    name: 'Дедович',
    photo: '/abzac/teacher-dedovich.webp',
    bio: 'Шеф-редактор Чтива и всея Русского Динозавра, ведущий радио Овердрайв, журналист Дискурса, писатель, продюсер, враг хорошего, зачинщик глобальных приколов, любимый сын Господа Бога, крушитель Министерства хаоса, убийца метамодерна.',
  },
  {
    name: 'Янкус',
    photo: '/abzac/teacher-yankus.webp',
    bio: 'Продюсер, филолог со стажем, подпольный философ и исследователь культуры во всех её проявлениях. Создатель авторских курсов по литературе, искусству и философии, поэт, писатель, автор статей на культурологические темы.',
  },
] as const

const LESSONS = [
  { title: 'Художественный текст', subtitle: 'Написание и редактура', teacher: 'Дедович' },
  { title: 'Инди-книгоиздание', subtitle: 'Древнее искусство в современности', teacher: 'Дедович' },
  { title: 'Продюсирование и управление творческими проектами', subtitle: null, teacher: 'Дедович' },
  { title: 'Создание бренда для личностей и компаний', subtitle: null, teacher: 'Дедович' },
  { title: 'Классическое стихосложение и верлибристика', subtitle: null, teacher: 'Арчет' },
  { title: 'Журналистика и расследования', subtitle: null, teacher: 'Арчет' },
  {
    title: 'Литература на грани — словесность в контексте медиа',
    subtitle: 'Словесность в контексте медиа',
    teacher: 'Янкус',
  },
] as const

export default function AbzacPage() {
  return (
    <div className={styles.page}>
      <AuthorsSidebar active='abzac' />

      <div className={styles.main}>
        <div className={styles.banner}>
          <Image
            src='/abzac/course-banner.jpg'
            alt='Мастерская Абзац'
            width={1920}
            height={720}
            className={styles.bannerImg}
            sizes='(max-width: 767px) 100vw, 1278px'
            priority
          />
        </div>

        <p className={styles.intro}>{INTRO}</p>

        <h2 className={styles.heading}>Преподаватели</h2>

        <div className={styles.teachers}>
          {TEACHERS.map((teacher) => (
            <article key={teacher.name} className={styles.teacher}>
              <Image
                src={teacher.photo}
                alt={teacher.name}
                width={280}
                height={280}
                className={styles.teacherPhoto}
                sizes='280px'
              />
              <div className={styles.teacherText}>
                <h3 className={styles.teacherName}>{teacher.name}</h3>
                <p className={styles.teacherBio}>{teacher.bio}</p>
              </div>
            </article>
          ))}
        </div>

        <h2 className={styles.heading}>Направления обучения</h2>

        <ul className={styles.lessons}>
          {LESSONS.map((lesson) => (
            <li key={lesson.title} className={styles.lesson}>
              <div className={styles.lessonInfo}>
                <span className={styles.lessonTitle}>{lesson.title}</span>
                {lesson.subtitle && <span className={styles.lessonSubtitle}>{lesson.subtitle}</span>}
              </div>
              <span className={styles.lessonTeacher}>{lesson.teacher}</span>
            </li>
          ))}
        </ul>

        <p className={styles.tail}>{TAIL}</p>

        <div className={styles.ctaWrap}>
          <AbzacEnrollButton />
        </div>
      </div>
    </div>
  )
}
