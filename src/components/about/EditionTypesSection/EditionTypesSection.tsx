import EditionTypeCard from './EditionTypeCard'
import editionPrintBw from '@/assets/about/edition-print-bw.png'
import editionPrintColor from '@/assets/about/edition-print-color.jpg'
import editionBook20Bw from '@/assets/about/edition-book20-bw.png'
import editionBook20Color from '@/assets/about/edition-book20-color.jpg'
import editionDigitalBw from '@/assets/about/edition-digital-bw.png'
import editionDigitalColor from '@/assets/about/edition-digital-color.jpg'
import styles from './EditionTypesSection.module.scss'

const CARDS = [
  {
    key: 'print',
    title: 'Печатные издания',
    description: 'Нестареющая классика — книги из деревьев',
    imageBw: editionPrintBw,
    imageColor: editionPrintColor,
    alt: 'Печатное издание на тёмном столе',
  },
  {
    key: 'book20',
    title: 'Книги 2.0',
    description: 'Компактная эстетика — материальный носитель цифрового издания',
    imageBw: editionBook20Bw,
    imageColor: editionBook20Color,
    alt: 'Издание Книги 2.0 у грифа гитары',
  },
  {
    key: 'digital',
    title: 'Цифровые и аудио издания',
    description: 'Экология и скорость — издания будущего',
    imageBw: editionDigitalBw,
    imageColor: editionDigitalColor,
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
            imageBw={card.imageBw}
            imageColor={card.imageColor}
            alt={card.alt}
          />
        ))}
      </div>
    </section>
  )
}
