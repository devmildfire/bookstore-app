import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledVideo } from './styles';

interface VideoPlayerProps extends ClassNameProps {
  readonly src: string;
  readonly fallbackSrc?: string;
  readonly autoplay?: boolean;
  readonly controls?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
}

const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  (props, ref) => {
    const {
      src, fallbackSrc, className, ...other
    } = props;
    return (
      <StyledVideo
        className={className}
        src={src}
        {...other}
        poster={fallbackSrc}
        ref={ref}
      >
        <source src={src} type='video/*' />
      </StyledVideo>
    );
  },
);

export default React.memo(VideoPlayer);
