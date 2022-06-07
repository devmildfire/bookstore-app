import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import colors from '@/utils/colors';

export const StyleWrapper = styled.section`
  margin-bottom: 105px;

  @media ${breakPoints.sm} {
    margin-bottom: 70px;
  }
`;

export const Title = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;

  @media ${breakPoints.xl} {
    margin-bottom: 26px;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
    line-height: 48px;
  }

  @media ${breakPoints.sm} {
    margin-bottom: 30px;
    font-size: 24px;
    line-height: 28px;
  }
`;

export const AuthorInfo = styled.div`
  position: relative;
  margin-bottom: 40px;
  display: flex;

  @media ${breakPoints.lg} {
    margin-bottom: 20px;
  }

  @media ${breakPoints.md} {
    flex-direction: column;
    align-items: center;
  }

  @media ${breakPoints.sm} {
    margin-bottom: 10px;
  }
`;

export const AuthorFoto = styled.img`
  margin-right: 40px;

  @media ${breakPoints.xl} {
    width: 416px;
    height: 294px;
  }

  @media ${breakPoints.md} {
    margin-right: 0;
    margin-bottom: 20px;
  }

  @media ${breakPoints.sm} {
    width: 288px;
    height: 200px;
  }
`;

export const AuthorDescr = styled.div`
  font-size: 24px;
  line-height: 29px;
`;

export const AuthorProps = styled.div`
  margin-bottom: 40px;
  font-weight: 700;

  @media ${breakPoints.xl} {
    margin-bottom: 25px;
  }

  @media ${breakPoints.lg} {
    margin-bottom: 19px;
    font-size: 18px;
    line-height: 22px;
  }

  @media ${breakPoints.sm} {
    margin-bottom: 15px;
    font-size: 16px;
    line-height: 20px;
    font-weight: 400;

    & span {
      display: block;
      margin-top: 5px;
    }
  }
`;

export const AuthorSpeech = styled.p`
  position: relative;
  max-width: 661px;
  font-style: italic;
  font-weight: 400;

  @media ${breakPoints.xl} {
    max-width: 558px;
    font-size: 20px;
    line-height: 24px;
  }

  @media ${breakPoints.lg} {
    max-width: 406px;
    font-size: 16px;
    line-height: 19.5px;
  }

  @media ${breakPoints.md} {
    font-size: 15px;
  }
`;

export const Quotes = styled.span`
  @media screen and (min-width: 960px) {
    display: none;
  }
`;

export const RedQuote = styled.span`
  position: absolute;
  right: -126px;
  top: -40px;
  font-style: italic;
  font-weight: 500;
  font-size: 105px;
  line-height: 128px;
  color: ${colors.red};

  @media ${breakPoints.xl} {
    top: -30px;
    right: -43px;
    font-size: 65px;
    line-height: 80px;
  }

  @media screen and (max-width: 1100px) {
    right: -8px;
  }

  @media ${breakPoints.lg} {
    right: -58px;
    font-size: 51px;
    line-height: 62px;
  }

  @media screen and (max-width: 960px) {
    display: none;
  }
`;

export const AuthorAbout = styled.p`
  margin-bottom: 54px;
  font-size: 24px;
  line-height: 29px;

  @media ${breakPoints.xl} {
    margin-bottom: 33px;
  }

  @media ${breakPoints.lg} {
    font-size: 16px;
    line-height: 19.5px;
  }

  @media ${breakPoints.sm} {
    margin-bottom: 22px;
  }
`;

export const AuthorContacts = styled.div`
  display: flex;
  justify-content: center;
  font-size: 18px;
  line-height: 22px;

  span {
    margin-right: 25px;
    font-weight: 700;

    @media ${breakPoints.sm} {
      font-size: 16px;
      line-height: 19.5px;
    }
  }

  @media ${breakPoints.sm} {
    & svg {
      width: 16.67px;
      height: 13.33px;
    }
  }
`;

export const ContactsList = styled.ul`
  display: flex;
  align-items: center;
`;

export const ContactsItem = styled.li`
  &:not(:last-child) {
    margin-right: 30px;

    @media ${breakPoints.sm} {
      margin-right: 21px;
    }
  }
`;

export const ContactLink = styled.a`
  & svg path {
    transition: fill 0.3s ease-in-out;
  }

  &:hover svg path {
    fill: ${colors.redBase};
    transition: fill 0.3s ease-in-out;
  }
`;
