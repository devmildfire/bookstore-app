import styled from 'styled-components';
import Text from '../Text';

export const StyledLink = styled.a`
  color: var(--main-white);
  :hover,
  :focus-visible {
    color: var(--main-red-100);
    outline: none;
  }
`;

export const StyledText = styled(Text)``;
