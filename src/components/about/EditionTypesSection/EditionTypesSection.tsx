import EditionTypeCard from './EditionTypeCard'
import editionPrint from '@/assets/about/edition-print.jpg'
import editionBook20 from '@/assets/about/edition-book20.jpg'
import editionDigital from '@/assets/about/edition-digital.jpg'
import styles from './EditionTypesSection.module.scss'

const CARDS = [
  {
    key: 'print',
    title: 'Печатные издания',
    description: 'Нестареющая классика — книги из деревьев',
    image: editionPrint,
    alt: 'Печатное издание на тёмном столе',
  },
  {
    key: 'book20',
    title: 'Книги 2.0',
    description: 'Компактная эстетика — материальный носитель цифрового издания',
    image: editionBook20,
    alt: 'Издание Книги 2.0 у грифа гитары',
  },
  {
    key: 'digital',
    title: 'Цифровые и аудио издания',
    description: 'Экология и скорость — издания будущего',
    image: editionDigital,
    alt: 'Цифровое издание с кассетной плёнкой',
  },
]

export default function EditionTypesSection() {
  return (
    <section className={styles.wrapper} aria-labelledby='editions-heading'>
      <h2 id='editions-heading' className={styles.heading}>
        Типы изданий
      </h2>
      <div className={styles.cards}>
        {CARDS.map((card) => (
          <EditionTypeCard
            key={card.key}
            title={card.title}
            description={card.description}
            image={card.image}
            alt={card.alt}
          />
        ))}
      </div>
    </section>
  )
}
