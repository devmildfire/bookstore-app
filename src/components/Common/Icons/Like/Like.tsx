import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledIcon } from './styles';
import LikeIcon from '@/assets/icons/like.svg';

const Like: React.FC<ClassNameProps> = (props) => {
  const { className, } = props;
  return (
    <StyledIcon className={className}>
      <LikeIcon />
    </StyledIcon>
  );
};

export default React.memo(Like);
