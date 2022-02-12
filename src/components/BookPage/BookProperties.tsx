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
  
  @media screen and (max-width: 1440px) {
    padding: 44px 24px 40px 60px;
    margin-bottom: 123px;
  } 
  
  @media screen and (max-width: 1024px) {
    padding: 33px 19px 40px 30px;
    margin-bottom: 100px;
  } 
  
  @media screen and (max-width: 576px) {
    padding: 18px 19px 13px;
    margin-bottom: 70px;
  } 
`;

const InnerContainer = styled.div`
  @media screen and (max-width: 576px) {
    max-width: 250px;
    margin: 0 auto;
  }
`;

const PropsHeader = styled.div`
  margin-bottom: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media screen and (max-width: 1440px) {
    max-width: 777px;
    flex-wrap: wrap;
    margin-bottom: 35px;
  } 
  
  @media screen and (max-width: 1024px) {
    max-width: 671px;
  } 
  
  @media screen and (max-width: 576px) {
    max-width: 243px;
    margin: 0 auto 21px;
  } 
`;

const PropsTitle = styled.div`
  font-weight: 700;
  font-size: 40px;  
  line-height: 49px;  
  
  @media screen and (max-width: 1024px) {
    font-size: 30px;
    line-height: 36px;
  } 
  
   @media screen and (max-width: 576px) {
    width: 100%;
    margin-bottom: 4px;
    font-size: 20px;
    line-height: 24px;
  } 
`;

const PropsBody = styled.div`
  display: flex;
  
  @media screen and (max-width: 576px) {
    flex-direction: column;
  }
`;

const PropsPrice = styled.div`
  font-weight: 700;
  font-size: 40px;
  line-height: 49px;
  
   @media screen and (max-width: 1024px) {
    font-size: 30px;
    line-height: 36px;
  } 
  
  @media screen and (max-width: 576px) {
    font-size: 20px;
    line-height: 24px;
  } 
`;

const PropsDate = styled.div`
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  
  @media screen and (max-width: 1440px) {
    margin-top: 14px;
    width: 100%;
    font-size: 20px;
    line-height: 24px;
  } 
  
  @media screen and (max-width: 576px) {
    width: auto;
    margin-top: 0;
    font-size: 12px;
    line-height: 14px;
    font-weight: 400;
  } 
`;

const PropsBtnBlock = styled.div`
  margin-right: 96px;
  
  .propsBtn {
    margin: 0;
    width: 300px;
    height: 70px;
    font-size: 16px;
    line-height: 20px;
    
    @media screen and (max-width: 576px) {
      width: 250px;
      height: 40px;
    } 
  }
  
  .propsBtn:last-child {
    margin-bottom: 20px;
  }
  
  @media screen and (max-width: 1440px) {
    margin-right: 44px;
  } 
  
  @media screen and (max-width: 1024px) {
    margin-right: 35px;
  } 
  
  @media screen and (max-width: 576px) {
    margin: 0 auto 5px;
    order: 1;
  } 
`;

const PropsItems = styled.div`
  width: 100%;
  
  @media screen and (max-width: 1440px) {
    display: flex;
    flex-direction: column;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 24px;
  } 
`;

const PropsItem = styled.div`
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 20px;
  
  span {
    margin-bottom: 15px;
    display: block;  
    
    @media screen and (max-width: 576px) {    
      margin-bottom: 7px;
    }  
  }
  
  &:last-child {
    @media screen and (max-width: 1440px) {
      order: -1;   
      margin-bottom: 30px;
    }
    
    @media screen and (max-width: 1024px) {
      margin-bottom: 15px;
    }
    
    @media screen and (max-width: 576px) {
      margin-bottom: 10px;
    }
  }
  
  @media screen and (max-width: 1440px) {
    margin-bottom: 15px; 
    
    &:nth-child(2) {
      margin-bottom: 0;
    }     
  }  
  
  @media screen and (max-width: 830px) {
    font-size: 12px;
    line-height: 14px;
  } 
  
  @media screen and (max-width: 576px) {
    margin-bottom: 10px; 
    
    &:nth-child(2) {
      margin-bottom: 0;
    }     
  }  
`;

const PropsFooter = styled.div`
  max-width: 1054px;
  font-size: 14px;
  line-height: 17px;
  
  @media screen and (max-width: 576px) {
    font-size: 10px;
    line-height: 12px;
  }
`;

const BookProperties = ({ book }: TBookProps):React.ReactElement => (
  <StyleWrapper>
    <InnerContainer>
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
    </InnerContainer>
  </StyleWrapper>
);

export default BookProperties;
