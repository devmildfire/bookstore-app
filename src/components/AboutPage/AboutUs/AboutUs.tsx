import React from 'react';
import styled from 'styled-components';
import Container from '../../Common/Container';
import Text from '../../Common/Text';
import Books from './Books';

const StyledHeader = styled(Text)`
  text-transform: uppercase;
`;

const AboutUs = () => (
  <div>
    <Container>
      <StyledHeader align='center' component='h2' fontFamily='serif'>
        О чем мы?
      </StyledHeader>
    </Container>

    <Books />
    <Container>
      <Text component='p'>
        <Text variant='h2' fontFamily='serif'>
          Н
        </Text>
        езависимое издательство Чтиво — дитя петербургского литандеграунда и
        сети интернет, увидевшее свет в 2017 году. Мы отбираем вещи для издания
        вне зависимости от известности автора, работаем с несерийными и
        неформальными произведениями и считаем, что книгоиздание не должно быть
        бизнесом.
      </Text>
    </Container>
  </div>
);

export default AboutUs;
