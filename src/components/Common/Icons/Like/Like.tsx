import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledLike, StyledLikeProps } from './styles';

interface LikeProps extends ClassNameProps, Partial<StyledLikeProps> {}

const Like: React.FC<LikeProps> = (props) => {
  const { className, isActive = false } = props;
  return <StyledLike className={className} isActive={isActive} />;
};

export default React.memo(Like);
