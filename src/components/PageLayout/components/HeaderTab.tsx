import React, { Fragment } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

// import Popper from '@/components/Common/Popper';
import { MenuItem } from '@/utils/menuItems';

import colors from '@/utils/colors';

export type HeaderTabProps = {
  item: MenuItem;
};

const StyledLink = styled.a`
  font-size: 14px;
  line-height: 17px;
  font-weight: normal;
  color: ${colors.grey};
  white-space: pre-wrap;
  opacity: 0.7;
  cursor: pointer;
  :hover {
    color: ${colors.redBase};
    opacity: 1;
  }
`;

const SubStyledLink = styled.a`
  font-size: 12px;
  line-height: 17px;
  font-weight: normal;
  color: ${colors.grey};
  white-space: pre-wrap;
  letter-spacing: 0.05em;
  opacity: 0.7;
  cursor: pointer;
  :hover {
    color: ${colors.redBase};
    opacity: 1;
  }
  @media (max-width: 1024px) {
    font-size: 10px;
  }
  @media (max-width: 830px) {
    font-size: 10px;
  }
  @media (max-width: 576px) {
    font-size: 8px;
  }
`;

const SubmenuTitle = styled.span`
  font-size: 14px;
  line-height: 17px;
  font-weight: normal;
  color: ${colors.grey};
  margin-bottom: 8px;
  opacity: 0.7;
  cursor: default;
`;

const SubmenuLink = styled(StyledLink)`
  font-size: 14px;
  line-height: 17px;
  opacity: 0.5;
  margin-top: 4px;
`;

const SubmenuItem = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`;

const PopperContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.blackBase};
  padding: 20px;
`;

const HeaderTab = ({
  item: { title, link, submenu },
}: HeaderTabProps): React.ReactElement => (
  <Fragment key={title}>
    {link ? (
      <Link href={link} passHref>
        <StyledLink href='fakeHref'>{title}</StyledLink>
      </Link>
    ) : (
      submenu?.map(({ subtitle, link: submenuLink, items }) => (
        <SubmenuItem key={subtitle}>
          {submenuLink ? (
            <Link href={submenuLink} passHref key={subtitle}>
              <StyledLink href='fakeHref'>{subtitle}</StyledLink>
            </Link>
          ) : (
            <>
              <SubmenuTitle>{subtitle}</SubmenuTitle>
              {items?.map(({ title: submenuTitle, link: subLink }) => (
                <Link href={subLink} passHref key={submenuTitle}>
                  <SubmenuLink href='fakeHref'>{submenuTitle}</SubmenuLink>
                </Link>
              ))}
            </>
          )}
        </SubmenuItem>
      ))
    )}
  </Fragment>
);

const SubHeaderTab = ({
  item: { title, link, submenu },
}: HeaderTabProps): React.ReactElement => (
  <Fragment key={title}>
    {link ? (
      <Link href={link} passHref>
        <SubStyledLink href='fakeHref'>{title}</SubStyledLink>
      </Link>
    ) : (
      <PopperContainer>
        {submenu?.map(({ subtitle, link: submenuLink, items }) => (
          <SubmenuItem key={subtitle}>
            {submenuLink ? (
              <Link href={submenuLink} passHref key={subtitle}>
                <SubStyledLink href='fakeHref'>{subtitle}</SubStyledLink>
              </Link>
            ) : (
              <>
                <SubmenuTitle>{subtitle}</SubmenuTitle>
                {items?.map(({ title: submenuTitle, link: subLink }) => (
                  <Link href={subLink} passHref key={submenuTitle}>
                    <SubmenuLink href='fakeHref'>{submenuTitle}</SubmenuLink>
                  </Link>
                ))}
              </>
            )}
          </SubmenuItem>
        ))}
      </PopperContainer>
    )}
  </Fragment>
);

export { SubHeaderTab, HeaderTab };
