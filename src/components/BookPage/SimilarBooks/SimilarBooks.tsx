import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
// import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import { Banner, Title } from './styles';
import { useGetBooksQuery } from '@/models/books';
import useScreenSize from '@/hooks/useScreenSize';
import breakPoints from '@/utils/breakPoints';

const StyledTitle = styled(Title)`
  padding-bottom: 85px;

  @media ${breakPoints.lg} {
    font-size: 42px;
  }

  @media screen and (max-width: 576px) {
    font-size: 24px;
  }
`;

const SimilarBooks = (): React.ReactElement => {
  // const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  const [width] = useScreenSize();
  const { data: books = [] } = useGetBooksQuery({ count: 5 });
  // const isSlider = isTabletVertical || isMobile;

  return (
    <section>
      <StyledTitle variant='h2_1' align='center'>
        Познайте также
      </StyledTitle>
      <Slider
        className='mySwiper'
        slidesPerView={width < 576 ? 1 : 3}
        withoutPagination
      >
        {books.map((book) => (
          <Slide key={book.id}>
            <Link href={`/books/${book.transliteratedTitle}`} passHref>
              <Banner src={book.cover} alt={book.title} />
            </Link>
          </Slide>
        ))}
      </Slider>
    </section>
  );
};

export default SimilarBooks;
