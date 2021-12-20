import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

import Popper from '../../Popper';

export type MenuItem = {
  title: string,
  link: string,
}

export type IHeaderTab = {
  title: string,
  link: string,
  submenu?: MenuItem[],
}

const StyledLink = styled.a`
  :hover {
    color: red;
    cursor: pointer;
  }
`;

const PopperContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: black;
  padding: 20px;
`;

const HeaderTab = ({
  title,
  link,
  submenu,
}: IHeaderTab): React.ReactElement => (
  <>
    {!submenu
      ? (
        <Link href={link} passHref>
          <StyledLink href='fakeHref'>{title}</StyledLink>
        </Link>
      )
      : (
        <Popper
          target={
            <StyledLink>{title}</StyledLink>
          }
          padding={20}
        >
          <PopperContainer>
            {submenu?.map((tab) => (
              <Link href={tab.link} passHref key={tab.title}>
                <StyledLink href='fakeHref'>{tab.title}</StyledLink>
              </Link>
            ))}
          </PopperContainer>
        </Popper>

      )}
  </>
);

export default HeaderTab;
