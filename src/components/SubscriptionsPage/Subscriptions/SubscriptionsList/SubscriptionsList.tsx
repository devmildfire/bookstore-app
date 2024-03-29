import * as React from 'react';
import { StyledList } from './styles';
import SubscriptionCard from './SubscriptionCard';
import subscriptions from '@/mocks/subscriptions';

const SubscriptionsList: React.FC = () => {
  return (
    <StyledList>
      {subscriptions.map((subscription) => (
        <SubscriptionCard {...subscription} key={subscription.id} />
      ))}
    </StyledList>
  );
};

export default React.memo(SubscriptionsList);
