import React from 'react';
import { StyleWrapper, Title, TrailerContainer, TrailerVideo } from './styles';

interface BookTrailerProps {
  readonly title: string;
  readonly src: string;
}

const BookTrailer = (props: BookTrailerProps): React.ReactElement => {
  const { src, title } = props;
  return (
    <StyleWrapper>
      <Title>Буктрейлер</Title>
      <TrailerContainer>
        <TrailerVideo
          src={src}
          title={title}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      </TrailerContainer>
    </StyleWrapper>
  );
};

export default BookTrailer;
