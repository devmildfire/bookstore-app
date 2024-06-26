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
  width: 100%;

  @media ${breakPoints.xl} {
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
