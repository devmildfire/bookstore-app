import * as React from 'react';
import classNames from 'classnames';
import { BoxSet } from '@/models/boxSets';
import {
  StyledActions,
  StyledDescription,
  StyledIconButton,
  StyledImage,
  StyledInfo,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';
import Price from '@/components/Common/Price';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';
import Cart from '@/components/Common/Icons/Cart';
import Like from '@/components/Common/Icons/Like';
import ProductCard from '@/components/Common/ProductCard';

interface SetCardProps extends BoxSet {
  readonly isOpen: boolean;
}

const SetCard: React.FC<SetCardProps> = (props) => {
  const { description, id, price, title, newPrice, isOpen, cover } = props;
  const path = usePrepareLink({
    query: {
      [GET_PARAMS.openProduct]: id.toString(),
    },
    keepOldQuery: true,
  });
  const classes = classNames('lighted', { active: isOpen });
  return (
    <ProductCard>
      <StyledWrapper className={classes} href={path} scroll={false} shallow>
        <StyledDescription>
          <StyledImage src={cover} alt={title} />
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
            <StyledIconButton>
              <Cart />
            </StyledIconButton>
            <StyledIconButton>
              <Like />
            </StyledIconButton>
          </StyledActions>
        </StyledInfo>
      </StyledWrapper>
    </ProductCard>
  );
};

export default SetCard;
