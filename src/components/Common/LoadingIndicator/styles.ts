import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 90px;
  height: 90px;
`;

export const StyledLoading = styled.div`
  height: 100%;
  width: 100%;

  border: 7px dotted var(--main-white-100);
  border-bottom-color: var(--main-white-10);
  border-right-color: var(--main-white-50);
  border-left-color: var(--main-white-50);
  border-radius: 50%;

  animation-name: spin;
  animation-duration: 2500ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  @keyframes spin {
    from {
      transform: rotate(15deg);
    }
    to {
      transform: rotate(375deg);
    }
  }
`;
