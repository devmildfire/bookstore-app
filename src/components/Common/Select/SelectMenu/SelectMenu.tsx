import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledMenu } from './styles';
import { stateContext } from '../contexts/StateContext';

const SelectMenu: React.FC<ClassNameProps> = (props) => {
  const { className, children, } = props;
  const { isOpen, root, } = React.useContext(stateContext);

  return (
    <StyledMenu
      className={className}
      width={root?.offsetWidth}
      isOpen={isOpen}
      target={root}
    >
      {children}
    </StyledMenu>
  );
};

export default SelectMenu;
