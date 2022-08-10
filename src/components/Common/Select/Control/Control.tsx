import * as React from 'react';
import classNames from 'classnames';
import { ClassNameProps } from '@/types/className';
import IconButton from '../../IconButton';
import { StyledArrow, StyledControls, StyledPlaceholder } from './styles';
import { stateContext, stateHandlersContext, valuesContext } from '../contexts';
import useKeyListener from '@/hooks/useKeyListener';

export interface ControlProps extends ClassNameProps {
  readonly title: string;
}

const Control: React.FC<ControlProps> = (props) => {
  const { title, className, } = props;
  const { isOpen, } = React.useContext(stateContext);
  const { onClose, onOpen, } = React.useContext(stateHandlersContext);
  const { hasValue, } = React.useContext(valuesContext);
  const [isFocus, setFocus] = React.useState<boolean>(false);

  const onFocus = React.useCallback(() => {
    setFocus(true);
  }, []);
  const onBlur = React.useCallback(() => {
    setFocus(false);
  }, []);

  const isActive = isOpen || isFocus || hasValue;
  const arrowClasses = classNames({ active: isActive, });
  const handler = isOpen ? onClose : onOpen;

  useKeyListener({
    onKeyDown: onOpen,
    keys: [' ', 'Enter'],
    condition: isFocus,
  });
  useKeyListener({
    onKeyDown: onClose,
    keys: ['Escape', 'Enter', ' '],
    condition: isOpen,
  });

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
