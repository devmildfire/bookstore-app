import * as React from 'react';
import { useGetSubscriptionsQuery } from '@/models/subscriptions';
import { StyledList } from './styles';
import SubscriptionCard from './SubscriptionCard';

const SubscriptionsList: React.FC = () => {
  const { data: subscriptions = [], } = useGetSubscriptionsQuery(undefined);
  return (
    <StyledList>
      {subscriptions.map((subscription) => (
        <SubscriptionCard {...subscription} key={subscription.id} />
      ))}
    </StyledList>
  );
};

export default React.memo(SubscriptionsList);
