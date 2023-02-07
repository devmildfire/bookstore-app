import styled from 'styled-components';

export const GridContainer = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;

  /* grid-template-columns: repeat(auto-fit, 350px); */
  /* padding: 0 2rem; */
  gap: 2rem;
  width: 100%;
  max-width: 1440px;
  box-sizing: border-box;
  /* padding: 0 2rem; */
`;

export const RowItem = styled.li``;

export const RowContainer = styled.ul`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;

  @media screen and (max-width: 512px) {
    & {
      justify-content: center;
    }
  }
`;

export const CardContainer = styled.li`
  transition: 0.1s ease;

  &:focus {
    outline: none;
    box-shadow: 0 0 8px 4px lightgray;
  }
`;

export const Cover = styled.img`
  display: block;
  min-width: 220px;
  max-width: 355px;
  width: 100%;
  object-fit: cover;
  transition: 0.1s ease;

  &:hover {
    transform: translateY(-3%);
    box-shadow: 0 0 8px 4px darkred;
  }
`;

interface PreviewProps {
  width: number;
}

export const Preview = styled.div<PreviewProps>`
  position: relative;
  transform: translateX(-50%);
  bottom: 0;
  left: 50%;
  width: ${(props) => `${props.width}px`};
  height: 250px;
  color: lightgray;
  background-color: #050505;
  &.hidden {
    visibility: hidden;
    opacity: 0;
    height: 0;
  }

  &.visible {
    visibility: visible;
    opacity: 1;
  }
`;
