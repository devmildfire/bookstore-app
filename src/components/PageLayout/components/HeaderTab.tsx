import React from 'react';
import Link from 'next/link';

export type MenuItem = {
  title: string,
  link: string,
}

export type IHeaderTab = {
  title: string,
  link?: string,
  submenu?: MenuItem[],
}

const HeaderTab = ({
  title,
  link,
  submenu,
}: IHeaderTab): React.ReactElement => {
  console.log(title);

  return (
    <>
      {link
        ? (
          <Link href={link} passHref>
            <a href='fakeHref'>{title}</a>
          </Link>
        )
        : submenu?.map((tab) => (
          <Link href={tab.link} passHref key={tab.title}>
            <a href='fakeHref'>{tab.title}</a>
          </Link>
        ))}
    </>
  );
};

export default HeaderTab;
