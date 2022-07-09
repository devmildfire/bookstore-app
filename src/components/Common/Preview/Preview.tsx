import * as React from 'react';
import Fade from '../Fade';
import { StyledCrossIcon, StyledIconButton, StyledWrapper } from './styles';

interface PreviewProps {
  readonly open: boolean;
  readonly changing: boolean;
  readonly timeout?: number;
}

const Preview: React.FC<PreviewProps> = (props) => {
  const {
    open, children, changing, timeout,
  } = props;

  return (
    <Fade open={open} timeout={timeout}>
      <Fade open={!changing} timeout={timeout}>
        <StyledWrapper>
          <StyledIconButton href='/books' scroll={false} size='small'>
            <StyledCrossIcon />
          </StyledIconButton>
          {children}
        </StyledWrapper>
      </Fade>
    </Fade>
  );
};

export default React.memo<React.PropsWithChildren<PreviewProps>>(Preview);
