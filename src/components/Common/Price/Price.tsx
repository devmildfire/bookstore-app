import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Text, { TextProps } from '../Text';
import { StyledOldPrice, StyledPriceInfo } from './styles';

interface PriceProps extends ClassNameProps {
  readonly price: number;
  readonly newPrice?: number | null;
  readonly priceTextProps?: TextProps<'span'>;
  readonly oldPriceTextProps?: TextProps<'span'>;
}

const Price: React.FC<PriceProps> = (props) => {
  const {
    price,
    newPrice,
    className,
    priceTextProps = {},
    oldPriceTextProps = {},
  } = props;
  return (
    <StyledPriceInfo className={className}>
      <Text
        variant='text'
        component='span'
        fontWeight={700}
        {...priceTextProps}
      >
        {`${newPrice || price}₽`}
      </Text>
      {newPrice && (
        <Text
          textColor='red'
          fontWeight={700}
          component='span'
          variant='text'
          {...oldPriceTextProps}
        >
          <StyledOldPrice>{`${price}₽`}</StyledOldPrice>
        </Text>
      )}
    </StyledPriceInfo>
  );
};

export default React.memo(Price);
