import styled from 'styled-components';
import Link from '@/components/Common/Link';
import Image from '@/components/Common/Image';
import IconButton from '@/components/Common/IconButton';

export const StyledWrapper = styled(Link)`
  display: grid;

  grid-template-rows: 1fr min-content;
  gap: 20px;

  width: 430px;
  height: 430px;

  padding: 20px 40px;

  background: linear-gradient(
    315.47deg,
    rgba(62, 62, 62, 0.5) -0.84%,
    rgba(0, 0, 0, 0.5) 100%
  );
  border-radius: 4px;
`;

export const StyledDescription = styled.div`
  align-self: end;

  display: grid;
  grid-template-rows: 1fr max-content max-content;
  gap: 14px;
`;

export const StyledImage = styled(Image)`
  justify-self: center;

  padding: 30px 60px;
`;

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledActions = styled.div`
  display: flex;
  gap: 40px;
`;

export const StyledIconButton = styled(IconButton)`
  color: var(--main-white-100);

  :hover,
  :focus-visible {
    color: var(--main-red-100);
  }
`;
