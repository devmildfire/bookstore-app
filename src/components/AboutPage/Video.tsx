import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export interface Source {
  readonly srcset: string;
  readonly type: string;
}

export interface VideoProps {
  readonly src: string;
  readonly sources?: Source[];
  // readonly metadata: string;
  readonly poster: string;
}

const StyledVideo = styled.video`
  width: var(--width); /* global --width = 1440px */
  max-width: calc(0.8 * 1440px);
  background-color: var(--grey);

  @media ${breakPoints.xl} {
    max-width: var(--width);
    width: calc(var(--width) - 0px); /* global --width = 1024px */
  }

  @media ${breakPoints.lg} {
    width: calc(var(--width) - 0px); /* global --width = 830px */
  }

  @media ${breakPoints.md} {
    width: calc(var(--width) - 0px); /* global --width = 500px */
  }

  @media ${breakPoints.smd} {
    width: calc(var(--width) + 0px); /* global --width = 500px */
  }

  @media ${breakPoints.sm} {
    width: calc(var(--width) + 0px); /* global --width = 320px */
  }
`;

const Video = (props: VideoProps): React.ReactElement => {
  const { src, poster, sources } = props;

  return (
    <StyledVideo poster={poster} src={src} controls>
      {sources?.map(({ srcset, type }) => (
        <source srcSet={srcset} type={type} />
      ))}
    </StyledVideo>
  );
};

export default Video;
