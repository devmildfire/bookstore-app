import * as React from 'react';
import { Gift } from '@/models/gifts';
import {
  StyledImageWrapper,
  StyledInfo,
  StyledWrapper,
  StyledActions,
  StyledIconButton,
} from './styles';
import Text, { TextProps } from '@/components/Common/Text';
import Cart from '@/components/Common/Icons/Cart';
import Like from '@/components/Common/Icons/Like';
import Image from '@/components/Common/Image';
import { ClassNameProps } from '@/types/className';
import Price from '@/components/Common/Price';

interface GiftCardProps
  extends Pick<Gift, 'title' | 'image' | 'price' | 'newPrice'>,
    ClassNameProps {}

const modifierProps: TextProps<'span'> = {
  variant: 'h3_2',
};

const GiftCard: React.FC<GiftCardProps> = (props) => {
  const { title, image, className, price, newPrice } = props;
  return (
    <StyledWrapper className={className}>
      <Text variant='h3_2'>{title}</Text>
      <StyledImageWrapper className='lighted'>
        <Image src={image} title={title} />
      </StyledImageWrapper>
      <StyledInfo>
        <Price
          price={price}
          newPrice={newPrice}
          oldPriceTextProps={modifierProps}
          priceTextProps={modifierProps}
        />
        <StyledActions>
          <StyledIconButton>
            <Cart />
          </StyledIconButton>
          <StyledIconButton>
            <Like />
          </StyledIconButton>
        </StyledActions>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default React.memo(GiftCard);
