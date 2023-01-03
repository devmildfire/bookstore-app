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
  /* position: absolute;
  top: calc(-1 * var(--top-div-gap)); */
  width: var(--width); /* global --width = 1440px */
  max-width: 1412px;
  background-color: var(--grey);
  /* width: 100%; */
  /* height: 794px; */

  @media ${breakPoints.xl} {
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
