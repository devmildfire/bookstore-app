import * as React from 'react';
import { BoxSet } from '@/models/boxSets';
import {
  StyledActions,
  StyledDescription,
  StyledInfo,
  StyledLike,
  StyledShopCard,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';
import Price from '@/components/Common/Price';
import IconButton from '@/components/Common/IconButton';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';

interface SetCardProps
  extends Pick<BoxSet, 'id' | 'price' | 'newPrice' | 'title' | 'description'> {}

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
        <Text component='h3' variant='p' fontWeight={700}>
          {title}
        </Text>
        <Text component='p' variant='body1'>
          {description}
        </Text>
      </StyledDescription>
      <StyledInfo>
        <Price price={price} newPrice={newPrice} />
        <StyledActions>
          <IconButton>
            <StyledShopCard />
          </IconButton>
          <IconButton>
            <StyledLike />
          </IconButton>
        </StyledActions>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default SetCard;
