import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledCrossIcon, StyledIconButton, StyledWrapper } from './styles';
import Collapse from '../Collapse';
import { COLLAPSE_DURATION } from '@/consts/animation';
import useScrollTo from '@/hooks/useScrollTo';

interface PreviewProps extends ClassNameProps {
  readonly open: boolean;
  readonly exitHref: string;
  readonly duration?: number;
  readonly exitTimeout?: number;
  readonly enterTimeout?: number;
}

const Preview: React.FC<PreviewProps> = (props) => {
  const {
    open,
    children,
    className,
    duration,
    exitTimeout,
    enterTimeout,
    exitHref,
  } = props;

  const [rootRef, setRootRef] = React.useState<HTMLElement | null>(null);

  useScrollTo(rootRef, { condition: open, timeout: COLLAPSE_DURATION });

  return (
    <Collapse
      open={open}
      duration={duration}
      exitTimeout={exitTimeout}
      enterTimeout={enterTimeout}
    >
      <StyledWrapper className={className} ref={setRootRef}>
        <StyledIconButton href={exitHref} scroll={false} size='small'>
          <StyledCrossIcon />
        </StyledIconButton>
        {children}
      </StyledWrapper>
    </Collapse>
  );
};

export default React.memo<React.PropsWithChildren<PreviewProps>>(Preview);
