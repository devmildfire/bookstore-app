import styled from 'styled-components';

interface StyledDivProps {
  height: number;
  width: number;
  picHeight: number;
  speed: number;
}

export const StyledDiv = styled.div<StyledDivProps>`
  --angle: 30deg;
  outline: 5px solid green;
  position: absolute;
  transform-origin: center;
  top: 50%;
  left: 50%;

  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;

  z-index: 10;

  transform: translate(
      ${(props) => (-1 * props.width) / 2}px,
      ${(props) => (-1 * props.height) / 2}px
    )
    rotate(calc(-1 * var(--angle))) skew(var(--angle));

  overflow: hidden;

  img {
    box-sizing: border-box;
    /* height: ${(props) => props.picHeight}px; */
    width: ${(props) => (props.picHeight * 516) / 290}px;
    padding: calc(${(props) => props.picHeight}px * 0.01);
  }

  > div {
    width: 100%;
  }
`;
