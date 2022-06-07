import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Like from '@/assets/icons/like.svg';
import Text from '../Common/Text';

export const StyledWrapper = styled.article`
  font-size: 16px;
  line-height: 20px;
  color: #f5f5f5;
  max-width: 320px;
`;

export const StyledLike = styled(Like)`
  width: 20px;
  height: 18px;
  fill: var(--${(props) => (props.liked ? 'red' : 'white')});

  transition: fill 0.2 ease-in-out;

  :hover,
  :focus-visible {
    fill: var(--${(props) => (props.liked ? 'white' : 'red')});
  }
`;

export const StyledBookInfo = styled.div`
  position: absolute;
  bottom: -100%;
  left: 0;
  right: 0;

  display: grid;
  gap: 15px;

  height: max-content;

  padding: 20px 15px;

  background-color: rgba(19, 19, 19, 0.9);

  transition: 0.5s ease-in-out;
`;

export const StyledCover = styled.div`
  position: relative;

  height: 452px;
  width: 320px;

  margin-bottom: 25px;

  box-shadow: 0.5px 0.5px 3px 1px rgb(207 207 236 / 20%);

  overflow: hidden;

  :hover ${StyledBookInfo} {
    bottom: 0%;
  }

  @media ${breakPoints.sm} {
    height: 365px;
    width: 250px;

    margin-bottom: 20px;
  }
`;

export const StyledImage = styled.img`
  height: 450px;
  width: 320px;

  object.fit: cover;
`;

export const StyledDescription = styled.div`
  display: grid;
  gap: 1em;
`;

export const StyledTitle = styled(Text)`
  margin-bottom: 10px;

  @media ${breakPoints.sm} {
    margin-bottom: 5px;
  }
`;

export const StyledAuthor = styled(Text)`
  margin-bottom: 23px;
  min-height: 2em;

  @media ${breakPoints.sm} {
    margin-bottom: 10px;
  }
`;

export const StyledPriceInfo = styled.div`
  display: flex;
  justify-content: space-between;

  margin-bottom: 40px;

  @media ${breakPoints.sm} {
    margin-bottom: 20px;
  }
`;

export const StyledOldPrice = styled(Text)`
  margin-right: 17px;
`;
