import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';

export const Title = styled(Text)`
  margin-bottom: 50px;
`;

export const BooksList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;

  .swiper-slide {
    text-align: center;
  }

  .mySwiper {
    @media ${breakPoints.sm} {
      margin: 0 -60px;
    }
  }
`;

export const BookItem = styled.li`
  flex: 0 0 18.5%;
`;

export const Banner = styled.img`
  width: 100%;
  height: 387px;

  @media ${breakPoints.xl} {
    height: 288.5px;
  }

  @media ${breakPoints.lg} {
    height: 228.5px;
  }

  @media ${breakPoints.md} {
    width: 120px;
    height: 190px;
  }

  @media screen and (max-width: 700px) {
    width: auto;
    height: auto;
  }
`;
