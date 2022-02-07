import React from 'react';
import styled from 'styled-components';

const ReadersList = styled.ul`
  margin-top: 20px;
  display: flex;
  justify-content:space-between;
`;

const readersList = [
  'eBoox: Android | iPhone',
  'FBReader: Android | iPhone',
  'KyBooks: iPhone',
];

const bookPropsList = [
  'Форматы: Fb2, Epub',
  'Кол-во символов: 355000',
  (
    <>
      <span>
        Рекомендуемые читалки:
      </span>
      <ReadersList>
        {readersList.map((reader) => (
          <li>
            {reader}
          </li>
        ))}
      </ReadersList>
    </>
  ),
];

export default bookPropsList;
