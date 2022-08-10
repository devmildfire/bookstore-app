import styled from 'styled-components';

export const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;

  overflow: auto;

  ::webkit-scrollbar {
    width: 12px;
    height: 12px;

    background-color: #aaa; /* or add it to the track */

    border-radius: 50%;
  }
`;
