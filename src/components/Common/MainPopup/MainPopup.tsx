import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Overlay from '../Overlay';
import Fade from '../Fade';
import { VoidFunction } from '@/types/common';
import FocusTrap from '../FocusTrap';
import useKeyListener from '@/hooks/useKeyListener';
import { StyledWrapper } from './styles';
import { BasePopupProps } from '@/types/popups';

interface MainPopupProps extends ClassNameProps, BasePopupProps {
  readonly onClose: VoidFunction;
}

const MainPopup: React.FC<MainPopupProps> = (props) => {
  const { children, className, isOpen, onClose, isFocus = isOpen, } = props;

  useKeyListener({
    onKeyDown: onClose,
    condition: isFocus,
    keys: ['Escape'],
  });

  return (
    <Overlay onClose={onClose}>
      <FocusTrap open={isFocus}>
        <Fade open={isOpen}>
          <StyledWrapper className={className}>{children}</StyledWrapper>
        </Fade>
      </FocusTrap>
    </Overlay>
  );
};

export default MainPopup;
