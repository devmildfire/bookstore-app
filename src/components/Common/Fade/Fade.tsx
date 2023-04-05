import * as React from 'react';
import { AnimatePresence, motion, Transition, Variants } from 'framer-motion';
import { FADE_DURATION } from '@/consts/animation';
import useMountDelay from '@/hooks/useMountDelay';
import { PropsWithChildren } from 'react';

export interface FadeProps {
  readonly open: boolean;
  readonly enterTimeout?: number;
  readonly exitTimeout?: number;
  readonly duration?: number;
}

const variants: Variants = {
  show: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
};

const Fade: React.FC<PropsWithChildren<FadeProps>> = (props) => {
  const {
    children,
    open,
    enterTimeout = 0,
    exitTimeout = 0,
    duration = FADE_DURATION,
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
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key='fade'
          variants={variants}
          transition={transition}
          initial='hidden'
          animate='show'
          exit='hidden'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Fade;
