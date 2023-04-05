import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  KeyboardEvent as ReactKeyEvent,
  ReactElement,
} from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ProductCard from '../ProductCard';
import {
  GridContainer,
  Preview,
  RowContainer,
  RowItem,
  CloseButton,
  Title,
  Author,
  Slogan,
  Description,
  Container,
  DescriptionBox,
  Button,
} from './styles';
import CloseIcon from '@/assets/icons/cross.svg';
import { Book } from '@/models/books';
import splitByRows from '@/utils/splitByRows';
import useScreenSize from '@/hooks/useScreenSize';
import useScrollTo from '@/hooks/useScrollTo';
// import Overlay from '@/assets/images/gradient-overlay.png';

const VideoContainer = styled.div`
  display: flex;
  position: relative;
  min-width: 60vw;
  min-height: 100%;
  overflow: hidden;
  background-image: linear-gradient(
    90deg,
    rgba(05, 05, 05, 1) 0%,
    rgba(05, 05, 05, 0) 20%
  );
  background-blend-mode: overlay;
  @media screen and (max-width: 1024px) {
    min-width: 100vw;
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

const Video = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-height: 100%;
  z-index: -2;
  object-fit: cover;
`;

const BookDescriptionContainer = styled(Container)`
  display: grid;
  grid-template-areas:
    'info info info'
    'description description description'
    'button . .';
  max-width: 40vw;
  padding: 5vh 5vw 5vh 10vw;
  @media screen and (max-width: 1024px) {
    max-width: 100%;
    grid-template-columns: 250px 1fr 1fr;
    grid-template-areas:
      'info  description description'
      'button  description description';
    padding-left: 5vw;
    column-gap: 5vw;
  }
`;

const InfoContainer = styled(Container)`
  grid-area: info;
`;

interface RowProps {
  row: Book[];
  data: Book[];
}

function Row({ row, data }: RowProps) {
  const [preview, setPreview] = useState<Book>();
  const [isOpen, setIsOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [width] = useScreenSize();
  const router = useRouter();
  const REDIRECT_ON_CLICK_DISPLAY_WIDTH = 768;

  const open = (id: number) => {
    if (width <= REDIRECT_ON_CLICK_DISPLAY_WIDTH) {
      const bookItem = data.find((book) => book.id === id);
      return router.push(`/books/${bookItem?.transliteratedTitle}`);
    }
    if (isOpen && id === preview?.id) {
      setIsOpen(false);
    } else {
      setPreview(data.find((book) => book.id === id));
      setIsOpen(true);
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  const onEnterKey = (event: ReactKeyEvent) => {
    if (preview && event.key === 'Enter') {
      open(preview.id);
    }
  };

  const closeOnEscape = (event: KeyboardEvent) => {
    if (isOpen && event.key === 'Escape') {
      close();
    }
  };

  useScrollTo(previewRef.current, isOpen);

  useEffect(() => {
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <RowItem>
      <RowContainer>
        {row.map((props) => (
          <ProductCard
            key={props.id}
            onEnterKey={onEnterKey}
            onClick={() => open(props.id)}
            {...props}
          />
        ))}
      </RowContainer>
      <div ref={previewRef}>
        {isOpen && preview && width > 512 && (
          <Preview
            className={isOpen ? 'visible' : 'hidden'}
            width={document.body.clientWidth}
          >
            <BookDescriptionContainer gap={32}>
              <InfoContainer gap={12}>
                <Title>{preview.title}</Title>
                <Author>
                  {preview.authors.map((author) => author.name).join(', ')}
                </Author>
                <Slogan>{preview.thesis}</Slogan>
              </InfoContainer>
              <DescriptionBox>
                <Description>
                  {preview.description}
                  {preview.description}
                  {preview.description}
                </Description>
              </DescriptionBox>
              <Button type='button'>Познать</Button>
            </BookDescriptionContainer>
            <VideoContainer>
              <Video autoPlay muted loop>
                <source src='video/preview.mp4' />
              </Video>
            </VideoContainer>
            <CloseButton onClick={close} type='button'>
              <CloseIcon />
            </CloseButton>
          </Preview>
        )}
      </div>
    </RowItem>
  );
}

interface GridProps {
  data: Book[];
}

const getColumns = (width: number) => {
  if (width <= 512) {
    return 1;
  }
  if (width < 1024) {
    return 2;
  }
  return 3;
};

export default function Products({ data }: GridProps): ReactElement {
  const [width] = useScreenSize();
  const inRow = useMemo(() => getColumns(width), [width]);
  const books = useMemo(() => splitByRows(data, inRow), [data, inRow]);

  return (
    <GridContainer>
      {books.map((arr, idx) => (
        <Row key={`${arr.toString()}+${idx + 1}`} row={arr} data={data} />
      ))}
    </GridContainer>
  );
}
