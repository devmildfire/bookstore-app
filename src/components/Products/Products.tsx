/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-redundant-roles */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  KeyboardEvent as ReactKeyEvent,
  ReactElement,
} from 'react';
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

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        close();
      }
    };

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
            url={preview.cover}
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

const getColumns = (width: number) => {
  if (width <= 512) {
    return 1;
  }
  if (width < 1024) {
    return 2;
  }
  return 3;
};

interface GridProps {
  data: Book[];
}

export default function Products({ data }: GridProps): ReactElement {
  const [width] = useScreenSize();
  const inRow = useMemo(() => getColumns(width), [width]);
  const Books = useMemo(() => splitByRows(data, inRow), [data, inRow]);

  return (
    <GridContainer>
      {Books.map((arr, idx) => (
        <Row key={`${arr.toString()}+${idx + 1}`} row={arr} data={data} />
      ))}
    </GridContainer>
  );
}
