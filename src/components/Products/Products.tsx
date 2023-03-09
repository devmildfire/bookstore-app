/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-redundant-roles */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// eslint-disable-next-line import/extensions
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  KeyboardEvent as ReactKeyEvent,
  ReactElement,
} from 'react';
import styled from 'styled-components';
import ProductCard from '../ProductCard';
import {
  GridContainer,
  Preview,
  RowContainer,
  RowItem,
  CloseButton,
  // Image,
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

const Video = styled.video`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 60%;
  height: 100%;
  z-index: -2;
  object-fit: cover;
`;

interface RowProps {
  row: Book[];
  data: Book[];
}

function Row({ row, data }: RowProps) {
  const [preview, setPreview] = useState<Book>();
  const [isOpen, setIsOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useScrollTo(previewRef.current, isOpen);

  const open = (id: number) => {
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
        {isOpen && preview && (
          <Preview
            className={isOpen ? 'visible' : 'hidden'}
            width={document.body.clientWidth}
          >
            <Container gap={32}>
              <Container gap={12}>
                <Title>{preview.title}</Title>
                <Author>
                  {preview.authors.map((author) => author.name).join(', ')}
                </Author>
                <Slogan>{preview.thesis}</Slogan>
              </Container>
              <DescriptionBox>
                <Description>{preview.description}</Description>
              </DescriptionBox>
              <Button type='button'>Познать</Button>
            </Container>
            <Video autoPlay loop src='video/preview.mp4'>
              <track kind='captions' />
            </Video>
            {/* <Image
              url={preview.cover}
              // src={preview.cover}
              // alt={preview.title}
            /> */}
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
