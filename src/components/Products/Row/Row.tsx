import React from 'react';
import { RowProps } from '../types';
// import { Title } from '@/models/books';
import useScreenSize from '@/hooks/useScreenSize';
import { useRouter } from 'next/router';
import useScrollTo from '@/hooks/useScrollTo';
import { RowContainer, RowItem } from './styles';
import { ProductCard, ProductCard3d } from '@/components/product-cards';
import { Preview } from './Preview';
// import { ITitle } from '@/entities/title/client';
import { Title } from 'pages/books';

const Row = ({
  row,
  data,
  buttonStyle,
  bookStyle,
  rowId,
  openRowId,
  handleOpenRow,
}: RowProps) => {
  const [preview, setPreview] = React.useState<Title>();
  const [titleSlug, setTitleSlug] = React.useState<string | null>(null);

  const [shouldClose, setShouldClose] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const [width] = useScreenSize();
  const router = useRouter();
  const REDIRECT_ON_CLICK_DISPLAY_WIDTH = 768;
  const isOpen = openRowId === rowId;

  const open = (id: number) => {
    const bookItem = data.find((book) => book.id === id);

    if (!bookItem) {
      return;
    }

    if (width <= REDIRECT_ON_CLICK_DISPLAY_WIDTH) {
      router.push(`/books/${bookItem?.slug}`);
      return;
    }

    setShouldClose(false);
    handleOpenRow(rowId);
    setPreview(bookItem);
    setTitleSlug(bookItem?.slug);

    // FIXME  добавлена простая заплатка, чтобы вид всегда прокручивался
    //  до элемента превью по клику на книгу, а не только один раз когда
    //  элемент отрисовывается в первый раз
    previewRef.current &&
      previewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
  };

  const close = () => {
    setShouldClose(true);
  };

  const onEnterKey = (event: React.KeyboardEvent) => {
    if (preview && event.key === 'Enter') {
      open(preview.id);
    }
  };

  useScrollTo(previewRef.current, isOpen, 400);

  React.useEffect(() => {
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
        {row.map((props) =>
          bookStyle === '3d' ? (
            <ProductCard3d
              key={props.id}
              onEnterKey={onEnterKey}
              onClick={() => open(props.id)}
              buttonStyle={buttonStyle}
              {...props}
            />
          ) : (
            <ProductCard
              key={props.id}
              onEnterKey={onEnterKey}
              onClick={() => open(props.id)}
              buttonStyle={buttonStyle}
              {...props}
            />
          )
        )}
      </RowContainer>
      <div ref={previewRef}>
        <Preview
          isOpen={isOpen}
          shouldClose={shouldClose}
          preview={preview}
          slug={titleSlug}
          videoContainerRef={videoContainerRef}
          width={width}
          handleClose={close}
        />
      </div>
    </RowItem>
  );
};

export default React.memo(Row);
