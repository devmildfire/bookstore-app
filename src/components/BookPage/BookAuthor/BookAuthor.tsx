import React, { ReactElement } from 'react';
import {
  AuthorAbout,
  // AuthorContacts,
  AuthorDescr,
  AuthorPhoto,
  AuthorInfo,
  AuthorProps,
  AuthorSpeech,
  StyleWrapper,
  Title,
} from './styles';
import { IAuthor } from '@/entities/author/client';

interface BookAuthorProps {
  readonly authors: IAuthor[];
}

const BookAuthor = (props: BookAuthorProps): ReactElement => {
  const { authors } = props;
  return (
    <StyleWrapper>
      <Title>Об авторе</Title>

      {authors.map(({ name, photo, city, birthDate, phrase, bio }) => (
        <AuthorInfo key={name}>
          <AuthorPhoto src={photo!} alt={name} />
          <AuthorDescr>
            <AuthorProps>
              <span key={name}>{`${name} `}</span>
              <span>{`${city} | ${birthDate}`}</span>
            </AuthorProps>

            <AuthorSpeech>{phrase}</AuthorSpeech>

            <AuthorAbout>{bio}</AuthorAbout>
            {/* <AuthorContacts>
    <span>Контакты:</span>
  </AuthorContacts> */}
          </AuthorDescr>
        </AuthorInfo>
      ))}
    </StyleWrapper>
  );
};

export default BookAuthor;
