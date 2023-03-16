import * as React from 'react';
import { Subscription } from '@/models/subscriptions';
import {
  StyledDescriptionWrapper,
  StyledFeature,
  StyledFeaturesList,
  StyledImage,
  StyledPriceWrapper,
  StyledWrapper,
} from './styles';
import Text, { TextProps } from '@/components/Common/Text';
import Price from '@/components/Common/Price';
import Button from '@/components/Common/Button';

type SubscriptionCardProps = Subscription;

const priceTextProps: TextProps<'span'> = {
  variant: 'h3_1',
  component: 'span',
};

const SubscriptionCard: React.FC<SubscriptionCardProps> = (props) => {
  const { features, price, title, cover } = props;
  return (
    <StyledWrapper>
      <StyledImage src={cover} alt={title} />
      <StyledDescriptionWrapper>
        <div>
          <Text variant='h3_2' align='center'>
            ЧУДО
          </Text>
          <Text variant='h3_1' align='center'>
            {title}
          </Text>
        </div>
        <StyledFeaturesList tag='ul'>
          {features.map((feature) => (
            <StyledFeature key={feature}>{feature}</StyledFeature>
          ))}
        </StyledFeaturesList>
        <StyledPriceWrapper>
          <Price price={price} priceTextProps={priceTextProps} />
          <Text variant='h4_1' component='p' align='center'>
            в месяц
          </Text>
        </StyledPriceWrapper>
        <Button>Подключить</Button>
      </StyledDescriptionWrapper>
    </StyledWrapper>
  );
};

export default React.memo(SubscriptionCard);
