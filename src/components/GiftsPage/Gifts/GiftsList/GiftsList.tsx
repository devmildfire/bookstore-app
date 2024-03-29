import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import gifts from '@/mocks/gifts';
import GiftCard from './GiftCard';
import { StyledList } from './styles';

const GiftsList: React.FC<ClassNameProps> = (props) => {
  const { className } = props;

  return (
    <StyledList className={className}>
      {gifts.map((gift) => (
        <GiftCard {...gift} key={gift.id} />
      ))}
    </StyledList>
  );
};

export default React.memo(GiftsList);
