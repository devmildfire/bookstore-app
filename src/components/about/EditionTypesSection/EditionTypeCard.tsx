import Image, { type StaticImageData } from 'next/image'
import styles from './EditionTypeCard.module.scss'

type Props = {
  title: string
  description: string
  image: StaticImageData
  alt: string
}

export default function EditionTypeCard({ title, description, image, alt }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={image}
          alt={alt}
          className={styles.image}
          sizes='(max-width: 532px) 100vw, (max-width: 1200px) 33vw, 400px'
          placeholder='blur'
        />
      </div>
      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
