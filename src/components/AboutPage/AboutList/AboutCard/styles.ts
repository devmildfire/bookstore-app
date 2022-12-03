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
    width: 312px;
    gap: 0px;
    padding: 33px 0px;
  }

  @media ${breakPoints.lg} {
    width: 253px;
    gap: 0px;
    padding: 18px 0px;
  }

  @media ${breakPoints.md} {
    width: 170px;
    gap: 0px;
    padding: 18px 0px;
  }

  @media ${breakPoints.sm} {
    flex-direction: row;
    gap: 13px;
    width: 285px;
    padding: 15px 0px;
    border-radius: 4px;
  }

  &.active {
    width: 180px;
    /* height: 220px; */
  }
`;

export default StyledCard;
