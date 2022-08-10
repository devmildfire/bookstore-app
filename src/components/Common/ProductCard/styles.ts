import styled from 'styled-components';

export const StyledWrapper = styled.div`
  .lighted {
    transform-origin: center;

    transition: all 250ms ease-in;

    &:hover,
    &:focus-visible,
    &.active {
      transform: scale(1.05);
      box-shadow: 0px 0px 50px var(--main-red-60);
    }
  }
`;
