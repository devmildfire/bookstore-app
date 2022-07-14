import * as React from 'react';
import Text from '../Text';
import { StyledPriceInfo } from './styles';

interface PriceProps {
  readonly price: number;
  readonly newPrice?: number | null;
}

const Price: React.FC<PriceProps> = (props) => {
  const { price, newPrice } = props;
  return (
    <StyledPriceInfo>
      <Text variant='p' component='span' fontWeight={700}>
        {`${newPrice || price}₽`}
      </Text>
      {newPrice && (
        <Text color='red' fontWeight={700} component='span' variant='p'>
          <del>{`${price}₽`}</del>
        </Text>
      )}
    </StyledPriceInfo>
  );
};

export default React.memo(Price);
