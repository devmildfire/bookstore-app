import * as React from 'react';
import { BoxSet } from '@/models/boxSets';
import {
  StyledActions,
  StyledDescription,
  StyledInfo,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';
import Price from '@/components/Common/Price';
import IconButton from '@/components/Common/IconButton';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';
import Cart from '@/components/Common/Icons/Cart';
import Like from '@/components/Common/Icons/Like';

type SetCardProps = Pick<BoxSet, 'id' | 'price' | 'newPrice' | 'title' | 'description'>

const SetCard: React.FC<SetCardProps> = (props) => {
  const {
    description, id, price, title, newPrice,
  } = props;
  const path = usePrepareLink({
    query: {
      [GET_PARAMS.openProduct]: id,
    },
  });
  return (
    <StyledWrapper href={path} scroll={false}>
      <StyledDescription>
        <Text variant='h3_3' fontWeight={700}>
          {title}
        </Text>
        <Text component='p' variant='h4_1'>
          {description}
        </Text>
      </StyledDescription>
      <StyledInfo>
        <Price price={price} newPrice={newPrice} />
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

export default SetCard;
