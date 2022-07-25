import * as React from 'react';
import { Gift } from '@/models/gifts';
import {
  StyledPrice,
  StyledImageWrapper,
  StyledInfo,
  StyledWrapper,
  StyledActions,
} from './styles';
import IconButton from '@/components/Common/IconButton';
import Text from '@/components/Common/Text';
import Cart from '@/components/Common/Icons/Cart';
import Like from '@/components/Common/Icons/Like';
import Image from '@/components/Common/Image';

interface GiftCardProps extends Gift {}

const GiftCard: React.FC<GiftCardProps> = (props) => {
  const { price, title, image } = props;
  return (
    <StyledWrapper>
      <StyledImageWrapper>
        <Image src={image} title={title} />
        <StyledPrice price={price} />
      </StyledImageWrapper>
      <StyledInfo>
        <Text>{title}</Text>
        <StyledActions>
          <IconButton>
            <Cart />
          </IconButton>
          <IconButton>
            <Like />
          </IconButton>
        </StyledActions>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default React.memo(GiftCard);
