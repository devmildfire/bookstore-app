import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  gap: 22px;
  /* padding: 50px 47px; */

  /* background-color: rgba(196, 196, 196, 0.1); */
  /* background-image: url(${(props: { image?: string }) => props.image || ''});
  background-position: center;
  background-size: cover; */

  @media ${breakPoints.xl} {
    width: 330px;
    /* Параметр высоты у карточек убран, так как это flex элемент и высоту свою он подберёт сам. А если высоту выставить вручную, то произойдёт переполнение элемента на некоторых разрешениях экрана и следующий элемент страницы будет наползать на элемент с карточками */
    /* height: 500px;  */

    padding: 33px 40px;
  }

  @media ${breakPoints.lg} {
    width: 270px;
    /* height: 400px; */

    padding: 26px 32px;
  }

  @media ${breakPoints.md} {
    width: 190px;
    /* height: 320px; */
    /* height: 400px; */
    padding: 18px 16px;
  }

  @media ${breakPoints.sm} {
    width: 160px;
    /* height: 180px; */

    padding: 15px 10px;

    border-radius: 4px;

    &.active {
      width: 180px;
      /* height: 220px; */
    }
  }
`;

export default StyledCard;
