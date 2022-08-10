import * as React from 'react';
import {
  AnimatePresence, motion, Transition, Variants
} from 'framer-motion';
import { COLLAPSE_DURATION } from '@/consts/animation';
import useMountDelay from '@/hooks/useMountDelay';

interface CollapseProps {
  readonly open: boolean;
  readonly duration?: number;
  readonly enterTimeout?: number;
  readonly exitTimeout?: number;
}
const variants: Variants = {
  close: {
    transform: 'scaleY(0)',
    transformOrigin: 'top',
  },
  open: {
    transform: 'scaleY(1)',
    transformOrigin: 'top',
  },
};

const Collapse: React.FC<CollapseProps> = (props) => {
  const {
    open,
    children,
    enterTimeout = 0,
    exitTimeout = 0,
    duration = COLLAPSE_DURATION,
  } = props;
  const isMount = useMountDelay({ open, enterTimeout, exitTimeout, });
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
