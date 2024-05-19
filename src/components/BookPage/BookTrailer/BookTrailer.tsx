import React from 'react';
import { StyleWrapper, Title, TrailerContainer, TrailerVideo } from './styles';

interface BookTrailerProps {
  readonly title: string;
  readonly src: string;
  readonly cover: string;
}

const BookTrailer = (props: BookTrailerProps): React.ReactElement => {
  const { src, title, cover } = props;
  return (
    <StyleWrapper>
      <Title>Буктрейлер</Title>
      <TrailerContainer>
        <TrailerVideo title={title} controls={true} muted={true} preload='auto'>
          <source src={`${src}#t=0.5`} />
        </TrailerVideo>
      </TrailerContainer>
    </StyleWrapper>
  );
};

export default BookTrailer;

// poster={`${src}#t=0.1`}
