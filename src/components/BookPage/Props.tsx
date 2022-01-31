import React from 'react';
import styled from 'styled-components';

import Button from '../Common/Button';
import { TBookProps } from './Book';

const StyleWrapper = styled.div`
  padding: 44px 79px 40px 132px;
  margin-bottom: 200px;
  border: 1px solid #930000;
  box-sizing: border-box;
`;

const PropsHeader = styled.div`
  margin-bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PropsTitle = styled.div`
  font-weight: 700;
  font-size: 40px;  
  line-height: 49px;  
`;

const PropsBody = styled.div`
  display: flex;
  
`;

const PropsPrice = styled.div`
  font-weight: 700;
  font-size: 40px;
  line-height: 49px;
`;

const PropsDate = styled.div`
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
`;

const PropsBtnBlock = styled.div`
  margin-right: 96px;
`;

const PropsItems = styled.div`
  width: 100%;
`;

const PropsItem = styled.div`
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 20px;
  
  span {
    margin-bottom: 20px;
  }
`;

const ReadersList = styled.ul`
  margin-top: 20px;
  display: flex;
  justify-content:space-between;
`;

const ReadersItem = styled.div``;

const PropsFooter = styled.div`
  max-width: 1054px;
  font-size: 14px;
  line-height: 17px;
`;

const Props = ({ book }: TBookProps):React.ReactElement => (
  <StyleWrapper>
    <PropsHeader>
      <PropsTitle>
        ЦИФРОВОЕ ИЗДАНИЕ
      </PropsTitle>
      <PropsPrice>
        {book.price}
      </PropsPrice>
      <PropsDate>
        Дата релиза: дд.мм.гггг
      </PropsDate>
    </PropsHeader>
    <PropsBody>
      <PropsBtnBlock>
        <Button
          text='Добавить в корзину'
          className='propsBtn'
        />
        <Button
          text='Демо-версия'
          className='propsBtn'
        />
      </PropsBtnBlock>
      <PropsItems>
        <PropsItem>
          Форматы: Fb2, Epub
        </PropsItem>
        <PropsItem>
          Кол-во символов: 355000
        </PropsItem>
        <PropsItem>
          <span>
            Рекомендуемые читалки:
          </span>
          <ReadersList>
            <ReadersItem>
              eBoox: Android | iPhone
            </ReadersItem>
            <ReadersItem>
              FBReader: Android | iPhone
            </ReadersItem>
            <ReadersItem>
              KyBooks: iPhone
            </ReadersItem>
          </ReadersList>
        </PropsItem>
      </PropsItems>
    </PropsBody>
    <PropsFooter>
      Над изданием работали: редактор Наталья Кислова,
      веб-мастер Серафим Лоза, дизайнер Екатерина Яковлева,
      верстальщик Леон Меликьянц, иллюстратор Евгений Борщевский
    </PropsFooter>
  </StyleWrapper>
);

export default Props;
