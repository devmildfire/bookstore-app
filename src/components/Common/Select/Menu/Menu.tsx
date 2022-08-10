import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import OptionsList from '../OptionsList';
import SelectedList from '../SelectedList';
import { StyledMenuWrapper } from './styles';
import Popper, { PopperProps } from '../../Popper';

interface MenuProps extends ClassNameProps, PopperProps {}

const Menu: React.FC<MenuProps> = (props) => {
  const { className, isOpen, target } = props;

  return (
    <Popper isOpen={isOpen} target={target}>
      <StyledMenuWrapper className={className} width={target?.offsetWidth}>
        <SelectedList />
        <OptionsList />
      </StyledMenuWrapper>
    </Popper>
  );
};

export default React.memo(Menu);
