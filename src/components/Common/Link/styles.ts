import styled from 'styled-components';

export const StyledLink = styled.a`
  display: inline-block;

  color: var(--main-white-100);
  :hover,
  :focus-visible {
    color: var(--main-red-100);
    outline: none;
  }
`;
