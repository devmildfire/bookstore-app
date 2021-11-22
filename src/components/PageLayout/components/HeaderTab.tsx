import React, { Fragment } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

export type MenuItem = {
  title: string,
  link: string,
}

export type IHeaderTab = {
  title: string,
  link?: string,
  submenu?: MenuItem[],
}

const StyledLink = styled.a`
  :hover {
    color: red;
    cursor: pointer;
  }
`;

const HeaderTab = ({
  title,
  link,
  submenu,
}: IHeaderTab): React.ReactElement => (
  <>
    {link
      ? (
        <Link href={link} passHref>
          <StyledLink href='fakeHref'>{title}</StyledLink>
        </Link>
      )
      : (
        <>
          <StyledLink>{title}</StyledLink>
          {submenu?.map((tab) => (
            // <Link href={tab.link} passHref key={tab.title}>
            //   <a href='fakeHref'>{tab.title}</a>
            // </Link>
            <Fragment key={tab.title} />
          ))}
        </>
      )}
  </>
);

export default HeaderTab;
