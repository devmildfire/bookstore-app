import styled from 'styled-components';

interface StyledDivProps {
  skewAngle: number;
  gammaAngle: number;
  slantAngle: number;
  height: number;
  width: number;
  picHeight: number;
  speed: number;
}

export const StyledDiv = styled.div<StyledDivProps>`
  --skewAngle: ${(props) => props.skewAngle}deg;
  --slantAngle: ${(props) => props.slantAngle}deg;
  outline: 5px solid green;
  position: absolute;
  transform-origin: center;
  top: 50%;
  left: 50%;

  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;

  z-index: 10;

  transform: translate(-50%, -50%) rotate(calc(-1 * var(--slantAngle)))
    skew(var(--skewAngle));

  /* overflow: hidden; */

  img {
    box-sizing: border-box;
    width: ${(props) => (props.picHeight * 516) / 290}px;
    padding: calc(${(props) => props.picHeight}px * 0.01);
  }

  // это свойство устанавливает ширину дочернего компонента Marquee
  // равное ширине этого родительского компонента StyledDiv
  > div {
    width: 100%;
  }
`;
