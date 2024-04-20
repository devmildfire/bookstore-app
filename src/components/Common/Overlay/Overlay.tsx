import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledBackdrop, StyledWrapper } from './styles';
import Portal from '../Portal';
import { VoidFunction } from '@/types/common';
import { PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface OverlayProps extends ClassNameProps {
  readonly onClose?: VoidFunction;
  readonly show?: boolean;
}

const MotionWrapper = motion(StyledWrapper);

const Overlay: React.FC<PropsWithChildren<OverlayProps>> = (props) => {
  const { children, className, onClose, show } = props;
  return (
    <Portal>
      <AnimatePresence>
        {show && (
          <MotionWrapper
            role='dialog'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween', duration: 0.5 }}
          >
            <StyledBackdrop
              role={onClose && 'button'}
              onClick={onClose}
              tabIndex={onClose && 0}
              title={onClose && 'overlay'}
              isClickable={!!onClose}
            />
            <div className={className}>{children}</div>
          </MotionWrapper>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default Overlay;
