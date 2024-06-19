import { Trigger } from '@/components/Common/Trigger';
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const MotionPreview = styled(motion.div)`
  display: flex;
  @media screen and (max-width: 1024px) {
    flex-direction: column-reverse;
  }
`;

interface PreviewProps {
  width: number;
}

export const PreviewContainer = styled.div<PreviewProps>`
  position: relative;
  transform: translateX(-50%);
  bottom: 0;
  left: 50%;
  width: ${(props) => `${props.width}px`};
  color: lightgray;
  background-color: #050505;
`;

type DescriptionBoxProps = {
  lowerBlur: boolean;
  upperBlur: boolean;
};

export const DescriptionBox = styled.div<DescriptionBoxProps>`
  display: block;
  // max-height: 150px;
  max-height: 100%;

  overflow-y: scroll;
  grid-area: description;

  mask-image: ${(props) => `
    linear-gradient(
    ${props.upperBlur ? `transparent` : `black`} 0%,
    black 25%,
    black 75%,
    ${props.lowerBlur ? `transparent` : `black`} 100% )`};

  -webkit-mask-image: ${(props) => `
    linear-gradient(
    ${props.upperBlur ? `transparent` : `black`} 0%,
    black 25%,
    black 75%,
    ${props.lowerBlur ? `transparent` : `black`} 100% )`};

  /* width */
  ::-webkit-scrollbar {
    width: 4px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #232323;
    border-radius: 8px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: var(--grey);
    border-radius: 8px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  @media screen and (max-width: 1024px) {
    max-height: 300px;
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

export const BookDescriptionContainer = styled(Container)`
  display: grid;
  grid-template-areas:
    'info info info'
    'description description description'
    'button . .';
  width: 60vw;
  max-width: 80ch;
  padding: 5vh 1vw 5vh 10vw;
  height: 100%;
  align-content: space-between;
  /* max-height: 565px; */
  @media screen and (max-width: 1024px) {
    max-width: 100%;
    width: 100%;
    grid-template-columns: minmax(250px, min-content) 1fr;
    grid-template-areas:
      'info  description description'
      'button  description description';
    padding-left: 5vw;
    column-gap: 5vw;
  }
`;

export const InfoContainer = styled(Container)`
  grid-area: info;
`;

export const Title = styled.h2`
  font-size: var(--font-heading-xl);
  font-family: 'Cheque', serif;
  line-height: 56px;
  font-weight: 900;
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

export const Button = styled(Trigger)`
  cursor: pointer;
  padding: 20px 80px;
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

export const VideoContainer = styled.div`
  display: flex;
  position: relative;
  width: 60vw;
  min-height: 100%;
  overflow: hidden;
  background-image: linear-gradient(
    90deg,
    rgba(05, 05, 05, 1) 0%,
    rgba(05, 05, 05, 0) 20%
  );
  background-blend-mode: overlay;
  @media screen and (max-width: 1024px) {
    width: 100%;
    min-height: 50vh;
    background-image: linear-gradient(
      0deg,
      rgba(05, 05, 05, 1) 0%,
      rgba(05, 05, 05, 0) 20%,
      rgba(05, 05, 05, 0) 80%,
      rgba(05, 05, 05, 1) 100%
    );
  }
`;

export const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 100%;
  z-index: -2;
  object-fit: cover;
`;
