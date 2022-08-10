import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledLoadingIndicator, StyledMenu } from './styles';
import { stateContext } from '../contexts';

const SelectMenu: React.FC<ClassNameProps> = (props) => {
  const { className, children, } = props;
  const { isOpen, root, isLoading, } = React.useContext(stateContext);

  return (
    <StyledMenu
      className={className}
      width={root?.offsetWidth}
      isOpen={isOpen}
      target={root}
    >
      {isLoading ? <StyledLoadingIndicator /> : children}
    </StyledMenu>
  );
};

export default SelectMenu;
