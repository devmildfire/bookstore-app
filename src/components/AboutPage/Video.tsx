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
}

const StyledVideo = styled.video`
  width: 100%;
  max-width: 1440px;
  height: 794px;
  background-color: var(--grey);

  @media ${breakPoints.xl} {
    height: 585px;
  }

  @media ${breakPoints.lg} {
    height: 464px;
  }

  @media ${breakPoints.md} {
    height: 320px;
  }

  @media ${breakPoints.sm} {
    height: 162px;
  }
`;

const Video = (props: VideoProps): React.ReactElement => {
  const { src, sources } = props;

  return (
    <StyledVideo src={src}>
      {sources?.map(({ srcset, type }) => (
        <source srcSet={srcset} type={type} />
      ))}
    </StyledVideo>
  );
};

export default Video;
