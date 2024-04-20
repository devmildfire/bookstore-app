import React from 'react';
import CartPlusOne from '@/assets/icons/CartPlusOne.svg';
import Text from '@/components/Common/Text';
import {
  ButtonsDiv,
  CourseCardDiv,
  CoursePriceDiv,
  CourseTextDiv,
  ItemsDiv,
  ItemsValuesDiv,
  StyledButton,
  ValuesDiv,
} from './styles';
import { CourseCardProps } from './Abzac';

export const CourseCard = (props: CourseCardProps): React.ReactElement => {
  const { format, teachers, duration, price } = props;
  return (
    <CourseCardDiv>
      <CourseTextDiv>
        <ItemsDiv>
          <Text variant='abzacCardText'>Формат: </Text>
          <Text variant='abzacCardText'>Лектор: </Text>
          <Text variant='abzacCardText'>Длительность: </Text>
        </ItemsDiv>
        <ValuesDiv>
          <Text variant='abzacCardText'>{format}</Text>
          <Text variant='abzacCardText'>
            {teachers &&
              teachers.length &&
              teachers.map((teacher) => {
                return teacher?.name || '';
              })}
          </Text>
          <Text variant='abzacCardText'>{duration}</Text>
        </ValuesDiv>
        <ItemsValuesDiv>
          <div>
            <Text variant='buttonText' textColor='white80'>
              Формат:
            </Text>
            <Text variant='buttonText' textColor='white'>
              {format}
            </Text>
          </div>
          <div>
            <Text variant='buttonText' textColor='white80'>
              {teachers && teachers.length > 1 ? 'Лекторы: ' : 'Лектор: '}
            </Text>
            {/* <Text variant='buttonText'>
              {teachers && teachers.length > 1
                ? teachers.map((teacher) => {
                    return teacher?.name + ` sdfsdf  ` || '';
                  })
                : teachers.map((teacher) => {
                    return teacher?.name || '';
                  })}
            </Text> */}
          </div>
          <div>
            <Text variant='buttonText' textColor='white80'>
              Длительность:{' '}
            </Text>
            <Text variant='buttonText'>{duration}</Text>
          </div>
        </ItemsValuesDiv>
      </CourseTextDiv>
      <CoursePriceDiv>
        {price && (
          <Text variant='courseBig' align='right'>
            {price + ' \u20BD'}
          </Text>
        )}
        <ButtonsDiv>
          <StyledButton className='cartButton' type='button'>
            Добавить в корзину
          </StyledButton>
          <CartPlusOne />
        </ButtonsDiv>
      </CoursePriceDiv>
    </CourseCardDiv>
  );
};
