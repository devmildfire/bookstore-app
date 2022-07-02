import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledCard = styled.div`
  display: flex;
  flex-direction: column-reverse;

  width: 460px;
  height: 700px;

  padding: 50px 47px;

  background-color: rgba(196, 196, 196, 0.1);
  background-image: url(${(props: { image?: string }) => props.image || ''});

  @media ${breakPoints.xl} {
    width: 340px;
    height: 500px;

    padding: 33px 40px;
  }

  @media ${breakPoints.lg} {
    width: 270px;
    height: 400px;

    padding: 26px 32px;
  }

  @media ${breakPoints.md} {
    width: 190px;
    height: 320px;
    padding: 18px 16px;
  }

  @media ${breakPoints.sm} {
    width: 160px;
    height: 180px;

    padding: 15px 10px;

    border-radius: 4px;

    &.active {
      width: 180px;
      height: 220px;
    }
  }
`;

export default StyledCard;
