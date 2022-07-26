import React, {
  useState, useRef, useMemo, memo,
} from 'react';
import { usePopper } from 'react-popper';

export type IPopper = {
  target: React.ReactElement;
  children: React.ReactElement;
  padding?: number;
};

/** TODO: сделать рендер в портал */
/** TODO: структурировать внутрянку */
/** TODO: сделать анимацию */
const Popper = ({
  target,
  children,
  padding = 0,
}: IPopper): React.ReactElement => {
  const [shouldShowPopper, setShowPopper] = useState(false);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const buttonRef = useRef(null);
  const popperRef = useRef(null);

  const popperControls = useMemo(
    () => ({
      onMouseEnter: () => setShowPopper(true),
      onMouseLeave: () => setShowPopper(false),
    }),
    [setShowPopper],
  );

  const offset = useMemo(
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

  const { styles, attributes } = usePopper(
    buttonRef.current,
    popperRef.current,
    {
      modifiers: [
        {
          name: 'arrow',
          options: {
            element: arrowRef,
          },
        },
        offset,
      ],
    },
  );

  return (
    <>
      <div ref={buttonRef} {...popperControls}>
        {target}
      </div>
      {shouldShowPopper && (
        <div
          ref={popperRef}
          {...popperControls}
          style={styles.popper}
          {...attributes.popper}
        >
          <div ref={setArrowRef} style={styles.arrow} id='arrow' />
          {children}
        </div>
      )}
    </>
  );
};

export default memo(Popper);
