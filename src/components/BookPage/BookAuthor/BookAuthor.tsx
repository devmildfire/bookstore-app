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
import getDateString from '@/utils/getDateString';
import Text from '@/components/Common/Text';

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
              {/* <span>{`${city} | ${getDateString(birthDate!)}`}</span> */}
            </AuthorProps>

            <AuthorSpeech>
              {phrase}
              <Text align='right' variant='h4_1' component='p' fontWeight={300}>
                {`${city} | ${getDateString(birthDate!)}`}
              </Text>
            </AuthorSpeech>

            {/* <span>{`${city} | ${getDateString(birthDate!)}`}</span> */}

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
