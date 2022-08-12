import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: fixed;
  inset: 0;

  z-index: var(--upper-z-index);

  display: flex;
  justify-content: center;
  align-items: center;

  height: 100%;
  width: 100%;
`;

interface StyledBackdropProps {
  readonly isClickable: boolean;
}

export const StyledBackdrop = styled.div<StyledBackdropProps>`
  position: absolute;
  inset: 0;

  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--low-z-index);

  cursor: ${(props) => (props.isClickable ? 'pointer' : 'default')};
`;
