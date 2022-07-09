import * as React from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';

interface FadeProps {
  readonly open: boolean;
  readonly timeout?: number;
}

const Fade: React.FC<FadeProps> = (props) => {
  const { children, open, timeout = 1000 } = props;
  const variants = React.useMemo<Variants>(
    () => ({
      hidden: {
        opacity: 0,
        transition: {
          duration: timeout / 1000,
        },
      },
      active: {
        opacity: 1,
        transition: {
          duration: timeout / 1000,
        },
      },
    }),
    [timeout],
  );

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key='fade'
          variants={variants}
          initial='hidden'
          animate='active'
          exit='hidden'
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo<React.PropsWithChildren<FadeProps>>(Fade);
