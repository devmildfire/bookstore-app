import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import OptionsList from './OptionsList';
import SelectedList from './SelectedList';
import { StyledMenuWrapper } from './styles';

const Menu: React.FC<ClassNameProps> = (props) => {
  const { className } = props;

  return (
    <StyledMenuWrapper className={className}>
      <SelectedList />
      <OptionsList />
    </StyledMenuWrapper>
  );
};

export default React.memo(Menu);
