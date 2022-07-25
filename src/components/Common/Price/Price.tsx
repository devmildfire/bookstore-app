import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Text from '../Text';
import { StyledPriceInfo } from './styles';

interface PriceProps extends ClassNameProps {
  readonly price: number;
  readonly newPrice?: number | null;
}

const Price: React.FC<PriceProps> = (props) => {
  const { price, newPrice, className } = props;
  return (
    <StyledPriceInfo className={className}>
      <Text variant='text' component='span' fontWeight={700}>
        {`${newPrice || price}₽`}
      </Text>
      {newPrice && (
        <Text color='red' fontWeight={700} component='span' variant='text'>
          <del>{`${price}₽`}</del>
        </Text>
      )}
    </StyledPriceInfo>
  );
};

export default React.memo(Price);
