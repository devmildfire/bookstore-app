import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

import Popper from '../../Popper';
import { MenuItem } from '../../../utils/colors';

import colors from '../../../utils/colors';

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
    color: ${colors.redBase};
    cursor: pointer;
  }
`;

const PopperContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.blackBase};
  padding: 20px;
`;

const HeaderTab = ({{
  title,
  link,
  submenu,
} = item}: HeaderTabProps): React.ReactElement => (
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
