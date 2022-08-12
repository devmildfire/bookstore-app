import styled from 'styled-components';
import IconButton from '../IconButton';
import Container from '../Container';

export const StyledHeader = styled.header`
  position: absolute;
  left: 0;
  right: 0;

  > * {
    z-index: var(--upper-z-index);
  }

  padding: 50px 100px;
`;

export const StyledContainer = styled(Container)`
  display: flex;
  justify-content: end;
  margin: 0 auto;
`;

export const StyledIconButton = styled(IconButton)`
  order: 10;

  color: var(--main-white-100);

  :hover,
  :focus-visible {
    color: var(--main-red-100);
  }
`;
