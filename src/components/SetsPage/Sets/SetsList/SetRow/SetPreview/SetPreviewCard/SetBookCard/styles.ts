import styled from 'styled-components';
import Link from '@/components/Common/Link';
import Image from '@/components/Common/Image';
import List from '@/components/Common/List';
import { PropsWithChildren } from 'react';

export const StyledText = styled.div`
  display: grid;

  grid-template-rows: 1fr 1fr;
`;

export const StyledWrapper = styled(Link)<
  PropsWithChildren<{ className?: string; href: string }>
>`
  display: grid;

  grid-template-columns: max-content 1fr;

  gap: 29px;

  color: var(--main-white-100);

  &:hover ${StyledText}, &:focus-visible ${StyledText} {
    transition: color 0.25s ease-in-out;

    color: var(--main-red-100);
  }
`;

export const StyledIconsList = styled(List)`
  display: flex;
  gap: 22px;
  color: var(--main-white-100);
`;

export const StyledIcon = styled.svg`
  width: 30px;
  height: 30px;

  stroke-width: 3px;
  :hover {
    color: var(--main-red-100);
  }
`;

export const StyledImage = styled(Image)`
  width: 120px;
  height: 168px;
`;
