import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledVideo, StyledWrapper } from './styles';
import { PropsWithChildren } from 'react';

interface VideoPlayerProps extends ClassNameProps {
  readonly src: string;
  readonly fallbackSrc?: string;
  readonly autoPlay?: boolean;
  readonly controls?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
}

function VideoPlayer(
  props: PropsWithChildren<VideoPlayerProps>,
  ref: React.RefObject<HTMLVideoElement>
) {
  const { src, fallbackSrc, children, className, ...other } = props;
  return (
    <StyledWrapper className={className}>
      <StyledVideo src={src} poster={fallbackSrc} ref={ref} {...other}>
        <source src={src} type='video/*' />
      </StyledVideo>
      {children}
    </StyledWrapper>
  );
}

export default React.memo(VideoPlayer);
