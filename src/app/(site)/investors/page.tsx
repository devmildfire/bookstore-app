import type { Metadata } from 'next'
import FeatherIcon from '@/assets/icons/feather.svg'
import PageHero from '@/components/common/PageHero'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Инвесторам и донаторам',
  description:
    'Программа социального инвестирования «Чтива»: поддержите свободную литературу от 30 000 ₽ и получите деньги назад с процентом, доступ к цифровой библиотеке и печатным новинкам.',
}

export default function InvestorsPage() {
  return (
    <div className={styles.page}>
      <PageHero
        eyebrow='Программа социального инвестирования'
        title={
          <>
            Инвесторам
            <br />и донаторам
          </>
        }
        lead={
          <>
            Наша миссия — отстоять принципы существования свободного художественного
            высказывания. Мы отбираем рукописи в зависимости от их литературной
            ценности, <em>а не коммерческого потенциала</em>.
          </>
        }
      />

      {/* ── Body ── */}
      <section className={styles.body}>
        <div className={styles.col}>
          <p className={styles.p}>
            Мы считаем, что книгоиздание не должно быть бизнесом, чтобы писатель
            оставался властителем дум, а не становился удовлетворителем потребительского
            спроса.
          </p>
          <p className={`${styles.p} ${styles.muted}`}>
            Чтиво было и остаётся социально-культурным проектом, который создают те, кто
            не может не заниматься литературой и книгоизданием. А чтобы те, кто понимает
            необходимость литературы, даже не обладая большими финансовыми активами, могли
            им в этом помогать, мы разработали программу социального инвестирования.
          </p>

          <div className={styles.invest}>
            <div className={styles.amount}>
              <span className={styles.amountLabel}>Вложить можно от</span>
              <span className={styles.amountValue}>
                <b>30&nbsp;000&nbsp;₽</b>
              </span>
            </div>
            <p className={styles.investDesc}>
              Ваши деньги пойдут на выпуск новых печатных изданий, оплату труда
              специалистов и расширение охвата Чтива.
            </p>
          </div>

          <p className={styles.benefitsLead}>
            Наши инвесторы получают <b>деньги назад с процентом</b>, а также:
          </p>
          <ul className={styles.benefits}>
            <li className={styles.benefit}>
              <span className={styles.benefitNum}>1</span>
              <span className={styles.benefitText}>
                <b>Почёт</b>
                <span>Признание имени среди тех, кто держит на плаву свободную литературу.</span>
              </span>
            </li>
            <li className={styles.benefit}>
              <span className={styles.benefitNum}>2</span>
              <span className={styles.benefitText}>
                <b>Цифровую библиотеку</b>
                <span>Доступ ко всей цифровой библиотеке Чтива на период сотрудничества.</span>
              </span>
            </li>
            <li className={styles.benefit}>
              <span className={styles.benefitNum}>3</span>
              <span className={styles.benefitText}>
                <b>Печатные новинки</b>
                <span>Все печатные новинки, вышедшие в период сотрудничества.</span>
              </span>
            </li>
          </ul>

          <p className={styles.sponsor}>
            Возможно спонсорство с указанием бренда спонсора в издании и сопутствующих
            материалах.
          </p>

          <p className={styles.contact}>
            Чтобы узнать больше и участвовать, пишите нам на{' '}
            <a className={styles.link} href='mailto:info@chtivo.spb.ru'>
              info@chtivo.spb.ru
            </a>
          </p>

          <div className={styles.pull}>
            <FeatherIcon className={styles.feather} aria-hidden />
            <p className={styles.quote}>
              Рекомендуйте нас тем, кому может быть интересно менять реальность вместе с
              нами.
            </p>
          </div>
        </div>
      </section>

      {/* ── Donation CTA ── */}
      <section className={styles.donate}>
        <div className={styles.donateIn}>
          <p>
            А если хотите сделать небольшой разовый или ежемесячный донат и получить
            бонусы от Чтива и Русского Динозавра — добро пожаловать на{' '}
            <a
              className={styles.link}
              href='https://boosty.to/chtivo'
              target='_blank'
              rel='noopener noreferrer'
            >
              Бусти
            </a>{' '}
            или оформите{' '}
            <a className={styles.link} href='/subscription'>
              подписку
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
