import React from 'react';
import * as Styled from './PurchaseInfo.styled';

const renderNumber = (number: number) => (number > 0 ? number : '-');

const ruble = `₽`;

type PurchaseInfoProps = {
  text: string;
  value: number;
  gridArea: string;
  isCurrencyAmount: boolean;
};

const PurchaseInfo = ({
  text,
  value,
  gridArea,
  isCurrencyAmount,
}: PurchaseInfoProps): React.ReactElement => (
  <Styled.Container theme={{ area: gridArea }}>
    <Styled.Text>{text}</Styled.Text>
    <Styled.Value>
      {renderNumber(value)}
      {isCurrencyAmount && <Styled.Value> {ruble}</Styled.Value>}
    </Styled.Value>
  </Styled.Container>
);

export default PurchaseInfo;
