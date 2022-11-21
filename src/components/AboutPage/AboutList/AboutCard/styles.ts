import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  gap: 8px;
  /* padding: 50px 47px; */

  /* background-color: rgba(196, 196, 196, 0.1); */
  /* background-image: url(${(props: { image?: string }) => props.image || ''});
  background-position: center;
  background-size: cover; */

  @media ${breakPoints.xl} {
    width: 330px;
    gap: 0px;
    /* Параметр высоты у карточек убран, так как это flex элемент и высоту свою он подберёт сам. А если высоту выставить вручную, то произойдёт переполнение элемента на некоторых разрешениях экрана и следующий элемент страницы будет наползать на элемент с карточками */
    /* height: 500px;  */

    padding: 33px 40px;
  }

  @media ${breakPoints.lg} {
    width: 270px;
    gap: 0px;
    /* height: 400px; */

    padding: 18px 18px;
  }

  @media ${breakPoints.md} {
    width: 190px;
    gap: 0px;
    /* height: 320px; */
    /* height: 400px; */
    padding: 18px 16px;
  }

  @media ${breakPoints.sm} {
    flex-direction: row;
    gap: 13px;
    width: 285px;
    /* height: 180px; */

    padding: 15px 0px;

    border-radius: 4px;
  }

  &.active {
    width: 180px;
    /* height: 220px; */
  }
`;

export default StyledCard;
