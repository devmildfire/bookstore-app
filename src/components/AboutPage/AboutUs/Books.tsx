import React, { ReactElement } from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import image1 from '@/assets/images/books1.png';
import image2 from '@/assets/images/books2.png';
import breakPoints from '@/utils/breakPoints';
import Container from '@/components/Common/Container';

const StyledWrapper = styled.div`
  --booksMarginTop: -40px;
  --maxBooksWidth: calc(3000px / 2);
  --minBookWidth: 100px;
  --booksWidth: max(min(var(--maxBooksWidth), 100vw / 2), var(--minBookWidth));
  --booksHeight: calc(var(--booksWidth) * 0.795);

  position: relative;
  height: calc(var(--booksHeight) + var(--booksMarginTop));

  @media ${breakPoints.xxl} {
    --booksMarginTop: 15px;
  }

  @media ${breakPoints.xl} {
    --booksMarginTop: 55px;
  }

  @media ${breakPoints.lg} {
    --booksMarginTop: 25px;
  }

  @media ${breakPoints.md} {
    --booksMarginTop: 35px;
  }

  @media ${breakPoints.smd} {
    --booksMarginTop: 0px;
  }

  @media ${breakPoints.sm} {
    --booksMarginTop: 40px;
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
    --bookOffset: 0px;
  }
`;

const StyledPhrase = styled.div`
  display: flex;
  flex-wrap: wrap;

  padding-top: 0px;
  padding-right: 0px;
  padding-left: 0px;
  margin-left: auto;
  margin-right: 125px;

  width: 800px;

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
    padding-top: 10px;
    width: 527px;
    margin-right: 85px;
  }

  @media ${breakPoints.lg} {
    width: 401px;
    padding-right: 0px;
    margin-right: 85px;
    padding-top: 0px;
  }

  @media ${breakPoints.md} {
    width: 355px;
    padding-top: 0px;
    padding-right: 0px;
    margin-right: 85px;
  }

  @media ${breakPoints.smd} {
    width: 305px;
    padding-top: 0px;
    padding-right: 0px;
    margin-right: 65px;
  }

  @media ${breakPoints.sm} {
    width: 286px;
    padding-top: 0px;
    padding-right: 0px;
    margin-right: 8px;
  }
`;

const StyledText = styled(Text)`
  padding-top: 30px;

  @media ${breakPoints.xl} {
    padding-top: 30px;
  }

  @media ${breakPoints.lg} {
    padding-top: 25px;
  }

  @media ${breakPoints.smd} {
    padding-top: 11px;
  }

  @media ${breakPoints.sm} {
    padding-top: 8px;
  }
`;

const Books = (): ReactElement => (
  <StyledWrapper>
    <Container>
      <StyledPhrase>
        <StyledText component='p' variant='h3_31'>
          О том, чтобы превращать
        </StyledText>
        <StyledText component='span' variant='h3_32'>
          Деньги в книги,
        </StyledText>
        <StyledText component='p' variant='h3_31'>
          а не наоборот
        </StyledText>
      </StyledPhrase>
    </Container>
    <StyledBooks />
  </StyledWrapper>
);

export default Books;
