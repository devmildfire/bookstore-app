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
  width: var(--width); /* global --width = 1440px */
  max-width: 1412px;
  background-color: var(--grey);
  /* width: 100%; */
  /* height: 794px; */

  @media ${breakPoints.xl} {
    width: calc(var(--width) - 9px); /* global --width = 1024px */
  }

  @media ${breakPoints.lg} {
    width: calc(var(--width) - 7px); /* global --width = 830px */
  }

  @media ${breakPoints.md} {
    width: calc(var(--width) - 0px); /* global --width = 500px */
  }

  @media ${breakPoints.sm} {
    width: calc(var(--width) + 0px); /* global --width = 320px */
  }
`;

const Video = (props: VideoProps): React.ReactElement => {
  const { src, sources } = props;

  return (
    <StyledVideo src={src} controls>
      {sources?.map(({ srcset, type }) => (
        <source srcSet={srcset} type={type} />
      ))}
    </StyledVideo>
  );
};

export default Video;
