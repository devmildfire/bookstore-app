import React from 'react';
import styled from 'styled-components';
import Text from '../../Common/Text';
import image1 from '../../../assets/images/books1.png';
import image2 from '../../../assets/images/books2.png';
import breakPoints from '../../../utils/breakPoints';
import Container from '../../Common/Container';

const StyledWrapper = styled.div`
  --booksMarginTop: 0px;
  --maxBooksWidth: calc(1920px / 2);
  --minBookWidth: 271px;
  --booksWidth: max(min(var(--maxBooksWidth), 100vw / 2), var(--minBookWidth));
  --booksHeight: calc(var(--booksWidth) * 0.795);

  position: relative;
  height: calc(var(--booksHeight) + var(--booksMarginTop));

  @media ${breakPoints.xl} {
    --booksMarginTop: 60px;
  }
`;

const StyledBooks = styled(Container)`
  --bookOffset: 0px;
  --bookTwoPosition: calc(var(--booksWidth) - 2px - var(--bookOffset));

  position: absolute;
  inset: 0;

  max-width: 1920px;

  background-image: url(${image1.src}), url(${image2.src});
  background-repeat: no-repeat;
  background-position: calc(0px - var(--bookOffset)), var(--bookTwoPosition);
  background-size: var(--booksWidth) 100%, var(--booksWidth) 100%;
  margin-top: var(--booksMarginTop);

  @media ${breakPoints.sm} {
    --bookOffset: 31px;
  }
`;

const StyledPhrase = styled.div`
  display: flex;
  flex-wrap: wrap;

  padding-top: 130px;
  margin-left: auto;

  width: 664px;

  > * {
    flex-basis: 100%;
  }

  > *:not(:first-child) {
    text-align: end;
  }


  @media ${breakPoints.xl} {
    padding-top: 100px;
  }

  @media ${breakPoints.lg} {
    width: 400px;

    padding-top: 30px;
  }

  @media ${breakPoints.sm} {
    width: 100%;
  }
`;

const Books = () => (
  <StyledWrapper>
    <Container>
      <StyledPhrase>
        <Text variant='p'>О том, чтобы превращать</Text>
        <Text variant='h3' color='red' fontFamily='serif'>
          Деньги в книги,
        </Text>
        <Text variant='p'>а не наоборот</Text>
      </StyledPhrase>
    </Container>
    <StyledBooks />
  </StyledWrapper>
);

export default Books;
