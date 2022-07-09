import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledVideo, StyledWrapper } from './styles';

interface VideoPlayerProps extends ClassNameProps {
  readonly src: string;
  readonly fallbackSrc?: string;
  readonly autoplay?: boolean;
  readonly controls?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
}

const VideoPlayer = React.forwardRef<
  HTMLVideoElement,
  React.PropsWithChildren<VideoPlayerProps>
>((props, ref) => {
  const {
    src, fallbackSrc, children, className, ...other
  } = props;
  return (
    <StyledWrapper className={className}>
      <StyledVideo src={src} poster={fallbackSrc} ref={ref} {...other}>
        <source src={src} type='video/*' />
      </StyledVideo>
      {children}
    </StyledWrapper>
  );
});

export default React.memo(VideoPlayer);
