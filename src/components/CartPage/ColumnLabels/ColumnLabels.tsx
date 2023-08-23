import React from 'react';
import * as Styled from './ColumnLabels.styled';

const ColumnLabels = (): React.ReactElement => (
  <Styled.Labels>
    <Styled.Label>Товар</Styled.Label>
    <Styled.Label>Тип издания</Styled.Label>
    <Styled.Label>Цена</Styled.Label>
    <Styled.Label>Количество</Styled.Label>
    <Styled.Label>Сумма</Styled.Label>
  </Styled.Labels>
);

export default ColumnLabels;
