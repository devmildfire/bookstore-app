import * as React from 'react';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';
import { COLLAPSE_DURATION } from '@/consts/animation';
import useMountDelay from '@/hooks/useMountDelay';
import { PropsWithChildren } from 'react';

interface CollapseProps {
  readonly open: boolean;
  readonly duration?: number;
  readonly enterTimeout?: number;
  readonly exitTimeout?: number;
}
const variants: Variants = {
  close: {
    // transform: 'scaleY(0)',
    // transformOrigin: 'top',
    opacity: 0,
    height: 0,
    // transitionDuration: '0.2s',
  },
  open: {
    // transform: 'scaleY(1)',
    // transformOrigin: 'top',
    opacity: 1,
    height: 'auto',
    // transitionDuration: '0.2s',
  },
};

const Collapse: React.FC<PropsWithChildren<CollapseProps>> = (props) => {
  const {
    open,
    children,
    enterTimeout = 0,
    exitTimeout = 0,
    duration = COLLAPSE_DURATION,
  } = props;
  const isMount = useMountDelay({ open, enterTimeout, exitTimeout });
  const transition = React.useMemo<Transition>(
    () => ({
      duration: duration / 1000,
    }),
    [duration]
  );

  if (!isMount) {
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={variants}
          transition={transition}
          initial='close'
          animate='open'
          exit='close'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo<React.PropsWithChildren<CollapseProps>>(Collapse);
