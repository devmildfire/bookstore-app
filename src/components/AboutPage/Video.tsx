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
  readonly poster: string;
}

const StyledVideo = styled.video`
  /* global --width = 1440px */
  /* width: var(--width); */
  width: 100%;
  /* max-width: calc(0.8 * 1440px); */

  /* max-width: calc(0.8 * var(--width)); */

  background-color: var(--grey);

  @media ${breakPoints.xl} {
    /* max-width: var(--width); */

    /* width: calc(var(--width) - 0px);  */
    /* global --width = 1024px */
  }
`;

const Video = (props: VideoProps): React.ReactElement => {
  const { src, poster, sources } = props;

  return (
    <StyledVideo poster={poster} src={src} controls>
      {sources?.map(({ srcset, type }) => (
        <source key={srcset} srcSet={srcset} type={type} />
      ))}
    </StyledVideo>
  );
};

export default Video;
