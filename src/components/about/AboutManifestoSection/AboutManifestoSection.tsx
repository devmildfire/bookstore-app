import Image from 'next/image'
import Link from 'next/link'
import moneyToBooks from '@/assets/about/money-to-books.png'
import styles from './AboutManifestoSection.module.scss'

export default function AboutManifestoSection() {
  return (
    <section className={styles.wrapper} aria-labelledby='about-heading'>

      {/* <div className={styles.topText}> */}
        <h2 id='about-heading' className={styles.heading}>
          О чём мы?
        </h2>

        {/* <div> */}
          <p className={styles.aboutLine1}>О том, чтобы превращать</p>
          <p className={styles.aboutLine2}>деньги в книги,</p>
          <p className={styles.aboutLine3}>а не наоборот</p>
        {/* </div> */}
      {/* </div> */}


      {/* <div className={styles.banner}> */}
        <Image
          src={moneyToBooks}
          alt=''
          className={styles.illustration}
          sizes='(max-width: 532px) 100vw, (max-width: 1200px) 90vw, 1920px'
          placeholder='blur'
          priority={false}
        />
      {/* </div> */}

      <div className={styles.manifesto}>
        <p className={styles.manifestoText}>
          Независимое издательство Чтиво — дитя петербургского литандеграунда и сети интернет, увидевшее свет в 2017&nbsp;году.
          Мы отбираем вещи для издания вне зависимости от известности автора, работаем с несерийными и неформальными
          произведениями и считаем, что книгоиздание не должно быть бизнесом.
        </p>

        <Link href='/manifest' className={styles.cta}>
          Манифест
        </Link>
      </div>

    </section>
  )
}
