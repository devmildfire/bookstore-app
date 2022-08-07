import * as React from 'react';
import classNames from 'classnames';
import { ClassNameProps } from '@/types/className';
import IconButton from '../../IconButton';
import { StyledArrow, StyledControls, StyledPlaceholder } from './styles';
import { StateContext } from '../contexts/StateContext';

interface ControlProps extends ClassNameProps {
  readonly title: string;
}

const Control: React.FC<ControlProps> = (props) => {
  const { title, className } = props;
  const {
    isOpen, isFocus, hasValue, onBlur, onClose, onFocus, onOpen,
  } = React.useContext(StateContext);
  const isActive = isOpen || isFocus || hasValue;
  const arrowClasses = classNames({ active: isActive });
  const handler = isOpen ? onClose : onOpen;
  return (
    <StyledControls className={className}>
      <StyledPlaceholder onClick={handler}>{title}</StyledPlaceholder>
      <IconButton onClick={handler} onBlur={onBlur} onFocus={onFocus}>
        <StyledArrow className={arrowClasses} />
      </IconButton>
    </StyledControls>
  );
};

export default React.memo(Control);
