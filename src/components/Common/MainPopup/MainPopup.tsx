import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Overlay from '../Overlay';
import PopupHeader, { PopupHeaderProps } from '../PopupHeader';
import Fade from '../Fade';
import { VoidFunction } from '@/types/common';
import PopupContent from '../PopupContent';
import FocusTrap from '../FocusTrap';
import useKeyListener from '@/hooks/useKeyListener';
import { StyledWrapper } from './styles';

interface MainPopupProps extends ClassNameProps, PopupHeaderProps {
  readonly isOpen: boolean;
  readonly isFocus?: boolean;
  readonly onClose: VoidFunction;
}

const MainPopup: React.FC<MainPopupProps> = (props) => {
  const {
    children,
    className,
    title,
    subtitle,
    isOpen,
    onClose,
    isFocus = isOpen,
  } = props;

  useKeyListener({
    onKeyDown: onClose,
    condition: isFocus,
    keys: ['Escape'],
  });

  return (
    <Overlay onClose={onClose}>
      <FocusTrap open={isFocus}>
        <Fade open={isOpen}>
          <StyledWrapper>
            <PopupHeader title={title} subtitle={subtitle} />
            <PopupContent className={className}>{children}</PopupContent>
          </StyledWrapper>
        </Fade>
      </FocusTrap>
    </Overlay>
  );
};

export default MainPopup;
