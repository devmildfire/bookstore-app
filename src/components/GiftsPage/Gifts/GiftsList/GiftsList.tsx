import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { useGetGiftsQuery } from '@/models/gifts';
import GiftCard from './GiftCard';
import { StyledList } from './styles';

const GiftsList: React.FC<ClassNameProps> = (props) => {
  const { className } = props;
  const { data: gifts = [] } = useGetGiftsQuery(undefined);

  return (
    <StyledList className={className}>
      {gifts.map((gift) => (
        <GiftCard {...gift} key={gift.id} />
      ))}
    </StyledList>
  );
};

export default React.memo(GiftsList);
