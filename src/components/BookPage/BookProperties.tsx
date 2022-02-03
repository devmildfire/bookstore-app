import React from 'react';
import styled from 'styled-components';
import { TBookProps } from '../../types/bookProps';
import Button from '../Common/Button';
import bookPropsList from '../../utils/bookPropertiesData';
import colors from '../../utils/colors';

const StyleWrapper = styled.section`
  padding: 44px 79px 40px 132px;
  margin-bottom: 135px;
  border: 1px solid ${colors.red};
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

const PropsFooter = styled.div`
  max-width: 1054px;
  font-size: 14px;
  line-height: 17px;
`;

const BookProperties = ({ book }: TBookProps):React.ReactElement => (
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
        {bookPropsList.map((bookPropsItem) => (
          <PropsItem>
            {bookPropsItem}
          </PropsItem>
        ))}
      </PropsItems>
    </PropsBody>
    <PropsFooter>
      Над изданием работали: редактор Наталья Кислова,
      веб-мастер Серафим Лоза, дизайнер Екатерина Яковлева,
      верстальщик Леон Меликьянц, иллюстратор Евгений Борщевский
    </PropsFooter>
  </StyleWrapper>
);

export default BookProperties;
