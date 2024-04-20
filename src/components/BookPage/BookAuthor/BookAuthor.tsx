import React, { ReactElement } from 'react';
import { Author } from '@/types/author';
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

interface BookAuthorProps {
  readonly authors: Author[];
}

const BookAuthor = (props: BookAuthorProps): ReactElement => {
  const { authors } = props;
  // const author = authors[0];
  return (
    <StyleWrapper>
      <Title>Об авторе</Title>
      <AuthorInfo>
        {/* <AuthorPhoto src={author.photo} alt={author.name} /> */}
        <AuthorDescr>
          <AuthorProps>
            {/* {authors.map(({ name }) => {
              return <span key={name}>{`${name} `}</span>;
            })} */}
            {/* <span>{`${author.city} | ${author.dateOfBirth}`}</span> */}
          </AuthorProps>
          {/* <AuthorSpeech>{author.phrase}</AuthorSpeech> */}
          {/* <AuthorAbout>{author.biography}</AuthorAbout> */}
          {/* <AuthorContacts>
            <span>Контакты:</span>
          </AuthorContacts> */}
        </AuthorDescr>
      </AuthorInfo>
    </StyleWrapper>
  );
};

export default BookAuthor;
