import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledBackdrop, StyledWrapper } from './styles';
import Portal from '../Portal';
import { VoidFunction } from '@/types/common';

interface OverlayProps extends ClassNameProps {
  readonly onClose?: VoidFunction;
}

const Overlay: React.FC<OverlayProps> = (props) => {
  const { children, className, onClose, } = props;
  return (
    <Portal>
      <StyledWrapper role='dialog'>
        <StyledBackdrop
          role={onClose && 'button'}
          onClick={onClose}
          tabIndex={onClose && 0}
          title={onClose && 'overlay'}
          isClickable={!!onClose}
        />
        <div className={className}>{children}</div>
      </StyledWrapper>
    </Portal>
  );
};

export default Overlay;
