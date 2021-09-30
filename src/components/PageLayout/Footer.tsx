import React from 'react';
import Link from 'next/link';

import styles from './PageLayout.module.css';

const Footer = (): React.ReactElement => (
  <div className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.footerTitle}>
        <span>Чти</span>
        <span>во</span>
      </div>
      <div className={styles.links}>
        <Link href='/to-readers' passHref>
          <a href='fakeHref'>Чтецам</a>
        </Link>
        <Link href='/to-authors' passHref>
          <a href='fakeHref'>Авторам</a>
        </Link>
        <Link href='/to-partners' passHref>
          <a href='fakeHref'>Партнерам</a>
        </Link>
        <Link href='/about' passHref>
          <a href='fakeHref'>О Чтиве</a>
        </Link>
        <Link href='/contacts' passHref>
          <a href='fakeHref'>Контакты</a>
        </Link>
      </div>
      <div className={styles.contacts}>
        <a
          href='https://russiandino.ru/'
          target='_blank'
          rel='noreferrer'
        >
          Создано Русским Динозавром
        </a>
        <a href='tel:+78129158367'>
          Тел. (812) 915-83-67
        </a>
        <a
          href='mailto:info@chtivo.spb.ru'
          target='_top'
        >
          E-mail info@chtivo.spb.ru
        </a>
      </div>
      <div className={styles.copyright}>
        <span>
          © 2017-2021&nbsp;
          <span>Чти</span>
          во. Санкт-Петербург. Все права защищены.
        </span>
      </div>
    </div>
  </div>
);

export default Footer;
