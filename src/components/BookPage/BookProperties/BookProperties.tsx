import React from 'react';
import dayjs from 'dayjs';
import Button from '@/components/Common/Button';
import {
  StyledBody,
  StyledButtons,
  StyledDate,
  StyledHeader,
  StyledItem,
  StyledProperties,
  StyledHeaderText,
  StyledWrapper,
  StyledTerm,
  StyledDescription,
  StyledReadersList,
  StyledReadersItem
} from './styles';
import Text from '@/components/Common/Text';
import { Reader, Worker } from '@/models/books';

interface BookPropertiesProps {
  readonly price: number;
  readonly publishDate: string;
  readonly workers: Worker[];
  readonly symbolCount: number;
  readonly formats: string[];
  readonly readers: Reader[];
}

const BookProperties = (props: BookPropertiesProps): React.ReactElement => {
  const {
    publishDate, price, workers, symbolCount, formats, readers,
  } = props;
  return (
    <StyledWrapper>
      <StyledHeader>
        <StyledHeaderText variant='h3_1'>ЦИФРОВОЕ ИЗДАНИЕ</StyledHeaderText>
        <StyledHeaderText variant='h3_1' component='p'>
          {price}
          &#8381;
        </StyledHeaderText>
        <StyledDate variant='text'>
          Дата релиза:
          <time dateTime={new Date(publishDate).toDateString()}>
            {dayjs(publishDate).format('DD.MM.YYYY')}
          </time>
        </StyledDate>
      </StyledHeader>
      <StyledBody>
        <StyledButtons>
          <Button>Добавить в корзину</Button>
          <Button>Демо-версия</Button>
        </StyledButtons>
        {/* Вынести в отдельный компонент */}
        <StyledProperties>
          <StyledItem>
            <StyledTerm>
              <Text>Форматы:&nbsp;</Text>
            </StyledTerm>
            <StyledDescription>
              <Text>{formats.join(', ')}</Text>
            </StyledDescription>
          </StyledItem>
          <StyledItem>
            <StyledTerm>
              <Text>Количество символов:&nbsp;</Text>
            </StyledTerm>
            <StyledDescription>
              <Text>{symbolCount}</Text>
            </StyledDescription>
          </StyledItem>
          <StyledItem>
            <StyledTerm>
              <Text>Рекомендуемые читалки:</Text>
            </StyledTerm>
            <StyledDescription>
              {/* Вынести в отдельный компонент */}
              <StyledReadersList>
                {readers.map(({ markets, name, }) => (
                  <StyledReadersItem>
                    {name}
                    : &nbsp;
                    {markets.map(({ href, name: marketName, }) => (
                      <Text component='span' key={href}>
                        <a href={href}>{marketName}</a>
                      </Text>
                    ))}
                  </StyledReadersItem>
                ))}
              </StyledReadersList>
            </StyledDescription>
          </StyledItem>
        </StyledProperties>
      </StyledBody>
      <footer>
        <Text component='p'>
          Над изданием работали:
          {workers
            .map(({ place, fullName, }) => `${place} ${fullName}`)
            .join(', ')}
        </Text>
      </footer>
    </StyledWrapper>
  );
};

export default BookProperties;
