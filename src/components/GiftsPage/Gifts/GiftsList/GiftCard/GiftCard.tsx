import * as React from 'react';
import { Gift } from '@/models/gifts';
import {
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
import { ClassNameProps } from '@/types/className';

interface GiftCardProps extends Pick<Gift, 'title' | 'image'>, ClassNameProps {}

const GiftCard: React.FC<GiftCardProps> = (props) => {
  const { title, image, className } = props;
  return (
    <StyledWrapper className={className}>
      <StyledImageWrapper className='lighted'>
        <Image src={image} title={title} />
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
