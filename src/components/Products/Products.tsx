import React, { useMemo, useState, ReactElement } from 'react';
import { GridContainer } from './styles';
import { Title } from '@/models/books';
import splitByRows from '@/utils/splitByRows';
import useScreenSize from '@/hooks/useScreenSize';
import { Row } from './Row';
import { ITitle } from '@/entities/title/client';
import { Titles } from 'pages/books';

interface GridProps {
  // data: Title[];
  // data: ITitle[];
  data: Titles;
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
  const [openRowId, setOpenRowId] = useState<number>();

  function handleOpenPreview(id: number) {
    setOpenRowId(id);
  }

  return (
    <GridContainer>
      {/* TODO @sergromm: удалить выбор стилей после того как решится что делать с кнопками */}
      {/* <Leva /> */}
      {books.map((row, idx) => (
        <Row
          buttonStyle='outlined'
          bookStyle='3d'
          key={`${row.toString()}+${idx + 1}`}
          row={row}
          handleOpenRow={handleOpenPreview}
          openRowId={openRowId}
          rowId={idx}
          data={data}
        />
      ))}
    </GridContainer>
  );
}
