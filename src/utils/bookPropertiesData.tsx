import React from 'react';
import styled from 'styled-components';

const ReadersList = styled.ul`
  display: flex;
  justify-content:space-between;
  
  @media screen and (max-width: 1440px) {
    flex-wrap: wrap;
  } 
  
  @media screen and (max-width: 576px) {    
    flex-direction: column; 
  }
`;

const ReadersItem = styled.li`
  margin-right: 15px;
  
  @media screen and (max-width: 1440px) {    
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
  
  @media screen and (max-width: 1440px) {    
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }
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
          <ReadersItem>
            {reader}
          </ReadersItem>
        ))}
      </ReadersList>
    </>
  ),
];

export default bookPropsList;
