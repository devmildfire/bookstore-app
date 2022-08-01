import * as React from 'react';
import classNames from 'classnames';
import { ClassNameProps } from '@/types/className';
import IconButton from '../../IconButton';
import { StyledArrow, StyledControls, StyledPlaceholder } from './styles';
import { VoidFunction } from '@/types/common';

interface ControlProps extends ClassNameProps {
  readonly onOpen: VoidFunction;
  readonly onClose: VoidFunction;
  readonly onFocus: VoidFunction;
  readonly onBlur: VoidFunction;
  readonly isOpen: boolean;
  readonly title: string;
}

const Control = React.forwardRef<HTMLDivElement, ControlProps>((props, ref) => {
  const {
    title, className, isOpen, onBlur, onFocus, onClose, onOpen,
  } = props;
  const arrowClasses = classNames({ active: isOpen });
  const handler = isOpen ? onClose : onOpen;
  return (
    <StyledControls
      className={className}
      onClick={handler}
      onBlur={onBlur}
      onFocus={onFocus}
      tabIndex={0}
      ref={ref}
    >
      <StyledPlaceholder>{title}</StyledPlaceholder>
      <IconButton onClick={handler}>
        <StyledArrow className={arrowClasses} />
      </IconButton>
    </StyledControls>
  );
});

export default React.memo(Control);
