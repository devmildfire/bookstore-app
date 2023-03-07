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
  /* inset: 0 -5% 0 -5%; */
  /* inset: 0; */

  z-index: 10;
  /* background: grey; */

  transform: translate(
      ${(props) => (-1 * props.width) / 2}px,
      ${(props) => (-1 * props.height) / 2}px
    )
    rotate(calc(-1 * var(--angle))) skew(var(--angle));

  overflow: hidden;

  img {
    box-sizing: border-box;
    height: ${(props) => props.picHeight}px;
    padding: calc(${(props) => props.picHeight}px * 0.01);
  }

  > div {
    width: 100%;
  }
  /* transform: rotateZ(-60deg); */
`;

// interface ContainerProps {
//   gap: number;
// }

// export const GridWrapper = styled.div<ContainerProps>`
//   --gap: ${(props) => props.gap}px;
//   position: relative;
//   /* возможно появится горизонтальный скролл, нужно тестить в проекте */
//   width: 100vw;
//   display: flex;

//   align-items: flex-start;
//   gap: var(--gap);
//   height: auto;

//   overflow: hidden;
// `;

// interface ContentProps {
//   direction: string;
//   time: number;
//   delay: number;
// }

// export const GridContent = styled.ul<ContentProps>`
//   flex-shrink: 0;
//   display: flex;
//   justify-content: space-around;
//   min-width: 100%;
//   gap: var(--gap);
//   list-style: none;

//   will-change: transform;

//   animation: scroll ${(props) => props.time}s linear infinite;
//   animation-direction: ${(props) => props.direction};
//   animation-delay: -${(props) => props.delay}s;

//   @keyframes scroll {
//     from {
//       transform: translate3D(0, 0, 0);
//     }
//     to {
//       transform: translate3D(calc(-100% - var(--gap)), 0, 0);
//     }
//   }
// `;
