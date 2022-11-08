import React, { ReactElement } from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import image1 from '@/assets/images/books1.png';
import image2 from '@/assets/images/books2.png';
import breakPoints from '@/utils/breakPoints';
import Container from '@/components/Common/Container';

const StyledWrapper = styled.div`
  --booksMarginTop: 0px;
  --maxBooksWidth: calc(3000px / 2);
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

  margin: 0;
  max-width: 3000px;
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

  padding-top: 23px;
  padding-right: 5px;
  padding-left: 5px;
  margin-left: auto;

  width: 1024px;

  > * {
    flex-basis: 100%;
  }

  > *:not(:first-child) {
    text-align: center;
  }
  > *:last-child {
    text-align: end;
  }

  @media ${breakPoints.xl} {
    padding-top: 30px;
    width: 800px;
  }

  @media ${breakPoints.lg} {
    width: 520px;

    padding-top: 30px;
  }

  @media ${breakPoints.sm} {
    width: 95%;
  }
`;

const StyledText = styled(Text)`
  padding-top: 55px;

  @media ${breakPoints.xl} {
    padding-top: 35px;
  }

  @media ${breakPoints.lg} {
    padding-top: 20px;
  }

  @media ${breakPoints.sm} {
    padding-top: 10px;
  }
`;

const Books = (): ReactElement => (
  <StyledWrapper>
    <Container>
      <StyledPhrase>
        <StyledText
          component='p'
          variant='h3_31'
          // fontWeight={400}
          // textTransform='none'
        >
          О том, чтобы превращать
        </StyledText>
        <StyledText component='span' variant='h3_32'>
          Деньги в книги,
        </StyledText>
        <StyledText
          component='p'
          variant='h3_32'
          // fontWeight={400}
          // textTransform='none'
        >
          а не наоборот
        </StyledText>
      </StyledPhrase>
    </Container>
    <StyledBooks />
  </StyledWrapper>
);

export default Books;
