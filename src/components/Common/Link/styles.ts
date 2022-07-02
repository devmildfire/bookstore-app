import styled from 'styled-components';
import Text from '../Text';

export const StyledLink = styled.a`
  color: var(--white);
  :hover,
  :focus-visible {
    color: var(--red);
    outline: none;
  }
`;

export const StyledText = styled(Text)``;
