import React from 'react';
import { StyleWrapper, Title, TrailerContainer, TrailerVideo } from './styles';

interface BookTrailerProps {
  readonly title: string;
  readonly src: string;
  readonly poster: string;
}

const BookTrailer = (props: BookTrailerProps): React.ReactElement => {
  const { src, title, poster } = props;
  return (
    <StyleWrapper>
      <Title>Буктрейлер</Title>
      <TrailerContainer>
        <TrailerVideo
          title={title}
          controls={true}
          muted={true}
          poster={poster}
          preload='auto'
        >
          <source src={src} />
        </TrailerVideo>
      </TrailerContainer>
    </StyleWrapper>
  );
};

export default BookTrailer;
