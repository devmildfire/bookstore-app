import Image, { type StaticImageData } from 'next/image'
import styles from './EditionTypeCard.module.scss'

type Props = {
  title: string
  description: string
  imageBw: StaticImageData
  imageColor: StaticImageData
  alt: string
}

export default function EditionTypeCard({ title, description, imageBw, imageColor, alt }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={imageColor}
          alt={alt}
          className={styles.imageColor}
          sizes='(max-width: 532px) 100vw, (max-width: 1200px) 33vw, 400px'
          placeholder='blur'
        />
        <Image
          src={imageBw}
          alt=''
          aria-hidden='true'
          className={styles.imageBw}
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
