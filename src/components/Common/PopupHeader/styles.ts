import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import IconButton from '../IconButton(deprecated)';

export const StyledWrapper = styled.header`
  position: relative;

  display: grid;
  align-items: center;
  justify-items: center;
`;

export const StyledButton = styled(IconButton)`
  position: absolute;
  right: 0;
  top: 50%;

  color: var(--main-white-100);

  transform: translateY(-50%);

  :hover,
  :focus-visible {
    color: var(--main-red-100);
  }
`;
