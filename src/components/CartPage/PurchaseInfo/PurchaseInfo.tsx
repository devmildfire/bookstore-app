import React from 'react';
import * as Styled from './PurchaseInfo.styled';

const renderNumber = (number: number) => (number > 0 ? number : '-');

type PurchaseInfoProps = {
  text: string;
  value: number;
  gridArea: string;
};

const PurchaseInfo = ({
  text,
  value,
  gridArea,
}: PurchaseInfoProps): React.ReactElement => (
  <Styled.Container theme={{ area: gridArea }}>
    <Styled.Text>{text}</Styled.Text>
    <Styled.Value>{renderNumber(value)}</Styled.Value>
  </Styled.Container>
);

export default PurchaseInfo;
