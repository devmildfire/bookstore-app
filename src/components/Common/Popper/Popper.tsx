import * as React from 'react';
import { Modifier, usePopper } from 'react-popper';
import { Placement } from '@popperjs/core';
import { ClassNameProps } from '@/types/className';
import Portal from '../Portal';

export interface PopperProps extends ClassNameProps {
  readonly target: HTMLElement | null;
  readonly padding?: number;
  readonly placement?: Placement;
}

const Popper: React.FC<PopperProps> = (props) => {
  const {
    target,
    children,
    className,
    placement = 'bottom',
    padding = 0,
  } = props;

  const [popperRef, setPopperRef] = React.useState<HTMLElement | null>(null);

  const offset = React.useMemo<Modifier<string>>(
    () => ({
      name: 'offset',
      options: {
        offset: ({ reference, popper, }: any) => [
          (popper.width - reference.width) / 2 - padding,
          0
        ],
      },
    }),
    [padding]
  );

  const { styles, attributes, } = usePopper(target, popperRef, {
    modifiers: [offset],
    placement,
  });

  return (
    <Portal>
      <div
        className={className}
        ref={setPopperRef}
        style={styles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </Portal>
  );
};

export default Popper;
