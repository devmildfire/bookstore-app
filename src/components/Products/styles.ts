import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';

export const GridContainer = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  width: 100%;
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
  display: flex;
  transform: translateX(-50%);
  bottom: 0;
  left: 50%;
  width: ${(props) => `${props.width}px`};
  height: auto;
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

  @media screen and (max-width: 1024px) {
    flex-direction: column-reverse;
  }
`;

interface BoxProps {
  gap: number;
}

export const Container = styled.div<BoxProps>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => `${props.gap}px`};
  align-items: flex-start;
  justify-content: center;
`;

export const DescriptionBox = styled.div`
  display: block;
  max-height: 200px;
  overflow-y: auto;
  grid-area: description;
  mask-image: linear-gradient(black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(black 90%, transparent 100%);
  @media screen and (max-width: 1024px) {
    max-height: 300px;
  }
`;

export const Title = styled.h2`
  font-size: var(--font-heading-xl);
  font-family: 'Cheque', serif;
`;

export const Author = styled.p`
  font-size: var(--font-xl);
`;

export const Slogan = styled.p`
  text-transform: uppercase;
  font-size: var(--font-m);
  opacity: 0.5;
  font-style: italic;
`;

export const Description = styled.p`
  font-size: var(--font-m);
  padding-top: 8px;
  line-height: 1.4;
`;

interface ImageProps {
  url: string;
}

export const Button = styled.button`
  background-color: transparent;
  border: thin solid var(--main-white-100);
  cursor: pointer;
  padding: 20px 80px;
  color: var(--main-white-100);
  border-radius: 4px;
  grid-area: button;
`;

export const Image = styled.div<ImageProps>`
  height: 100%;
  width: 100%;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  width: 30px;
  color: white;
  background: transparent;
  cursor: pointer;
  transition: 0.1s;
  &:hover {
    opacity: 0.5;
  }
`;
