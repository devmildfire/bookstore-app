import styled from 'styled-components';
import Navigation from '@/components/Navigation';

export const StyledWrapper = styled.main`
  /* display: grid; */
  /* gap: 140px; */
  padding: 0 10vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--main-black);
  /* max-width: 1440px; */
  width: 100%;
  /* box-sizing: content-box; */
  margin: 0 auto;
`;

export const StyledNavigation = styled(Navigation)`
  position: sticky;
  top: var(--header-height);

  padding: 1rem var(--main-margin);

  margin: 0;

  background-color: var(--main-black);

  z-index: var(--upper-z-index);
`;

export const StyledContentWrapper = styled.div`
  display: grid;
  gap: 90px;
`;
