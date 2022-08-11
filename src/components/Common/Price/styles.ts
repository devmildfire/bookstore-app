import styled from 'styled-components';

export const StyledPriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 17px;

  width: max-content;
`;

export const StyledOldPrice = styled.del`
  position: relative;

  text-decoration: none;

  ::before {
    content: '';

    position: absolute;
    inset: 0;
    z-index: var(--up-z-index);

    background-image: linear-gradient(
      -18deg,
      transparent 0,
      transparent calc(50% - 1px),
      var(--main-red-100) calc(50% - 1px),
      var(--main-red-100) calc(50% + 1px),
      transparent calc(50% + 1px)
    );
  }
`;
