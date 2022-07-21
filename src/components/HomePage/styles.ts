import styled from 'styled-components';
import Navigation from './Navigation';

export const StyledWrapper = styled.main`
  display: grid;
  gap: 140px;
`;

export const StyledNavigation = styled(Navigation)`
  position: sticky;
  top: var(--header-height);

  padding: 1rem var(--main-margin);

  margin: 0;

  background-color: var(--main-black);

  z-index: var(--upper-z-index);
`;
