import React from 'react';
import { RowProps } from '../types';
import { Book } from '@/models/books';
import useScreenSize from '@/hooks/useScreenSize';
import { useRouter } from 'next/router';
import useScrollTo from '@/hooks/useScrollTo';
import { RowContainer, RowItem } from './styles';
import { ProductCard, ProductCard3d } from '@/components/product-cards';
import { Preview } from './Preview';

const Row = ({
  row,
  data,
  buttonStyle,
  bookStyle,
  rowId,
  openRowId,
  handleOpenRow,
}: RowProps) => {
  const [preview, setPreview] = React.useState<Book>();
  const [shouldClose, setShouldClose] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const [width] = useScreenSize();
  const router = useRouter();
  const REDIRECT_ON_CLICK_DISPLAY_WIDTH = 768;
  const isOpen = openRowId === rowId;

  const open = (id: number) => {
    if (width <= REDIRECT_ON_CLICK_DISPLAY_WIDTH) {
      const bookItem = data.find((book) => book.id === id);
      return router.push(`/books/${bookItem?.transliteratedTitle}`);
    }

    const newPreview = data.find((book) => book.id === id);

    setShouldClose(false);
    handleOpenRow(rowId);
    setPreview(newPreview);
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
          videoContainerRef={videoContainerRef}
          width={width}
          handleClose={close}
        />
      </div>
    </RowItem>
  );
};

export default React.memo(Row);
