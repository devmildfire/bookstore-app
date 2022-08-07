import * as React from 'react';
import { Modifier, usePopper } from 'react-popper';
import Portal from '../Portal';

export interface PopperProps {
  readonly target: HTMLElement | null;
  readonly isOpen: boolean;
  readonly padding?: number;
}

/** TODO: сделать анимацию */
const Popper: React.FC<PopperProps> = (props) => {
  const {
    isOpen, target, children, padding = 0,
  } = props;

  const popperRef = React.useRef(null);

  const offset = React.useMemo<Modifier<string>>(
    () => ({
      name: 'offset',
      options: {
        offset: ({ reference, popper }: any) => [
          (popper.width - reference.width) / 2 - padding,
          0,
        ],
      },
    }),
    [padding],
  );

  const { styles, attributes } = usePopper(target, popperRef.current, {
    modifiers: [offset],
  });

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <div ref={popperRef} style={styles.popper} {...attributes.popper}>
        {children}
      </div>
    </Portal>
  );
};

export default Popper;
