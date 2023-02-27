import styled from 'styled-components';

interface ContainerProps {
  gap: number;
}

export const MarqueeWrapper = styled.div<ContainerProps>`
  --gap: ${(props) => props.gap}px;
  position: relative;
  /* возможно появится горизонтальный скролл, нужно тестить в проекте */
  width: 100vw;
  display: flex;

  align-items: flex-start;
  gap: var(--gap);
  height: auto;
`;

interface ContentProps {
  direction: string;
  speed: number;
  delay: number;
}

export const MarqueeContent = styled.ul<ContentProps>`
  flex-shrink: 0;
  display: flex;
  justify-content: space-around;
  min-width: 100%;
  gap: var(--gap);
  list-style: none;

  animation: scroll ${(props) => props.speed}s linear infinite;
  animation-direction: ${(props) => props.direction};
  animation-delay: -${(props) => props.delay}s;

  @keyframes scroll {
    from {
      transform: translate3D(0, 0, 0);
    }
    to {
      transform: translate3D(calc(-100% - var(--gap)), 0, 0);
    }
  }
`;
