import styled from 'styled-components';
import Link from '@/components/Common/Link';
import Image from '@/components/Common/Image';

export const StyledWrapper = styled(Link)`
  display: grid;

  grid-template-columns: max-content 1fr;

  gap: 29px;

  &:hover *,
  &:focus-visible * {
    transition: color 0.25s ease-in-out;

    color: inherit;
  }
`;

export const StyledImage = styled(Image)`
  width: 120px;
  height: 168px;
`;

export const StyledText = styled.div`
  display: grid;

  grid-template-rows: min(50px, max-content) 1fr;
`;
