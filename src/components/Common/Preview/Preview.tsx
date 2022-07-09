import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledCrossIcon, StyledIconButton, StyledWrapper } from './styles';
import Collapse from '../Collapse';

interface PreviewProps extends ClassNameProps {
  readonly open: boolean;
  readonly duration?: number;
  readonly exitTimeout?: number;
  readonly enterTimeout?: number;
}

const Preview = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<PreviewProps>
>((props, ref) => {
  const {
    open, children, className, duration, exitTimeout, enterTimeout,
  } = props;

  return (
    <Collapse
      open={open}
      duration={duration}
      exitTimeout={exitTimeout}
      enterTimeout={enterTimeout}
    >
      <StyledWrapper className={className} ref={ref}>
        <StyledIconButton href='/books' scroll={false} size='small'>
          <StyledCrossIcon />
        </StyledIconButton>
        {children}
      </StyledWrapper>
    </Collapse>
  );
});

export default React.memo(Preview);
