import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import colors from '@/utils/colors';

export const StyleWrapper = styled.section`
  @media ${breakPoints.sm} {
  }
  @media screen and (max-width: 576px) {
    padding: 0 20px;
  }
`;

export const Title = styled.h2`
  padding-bottom: 85px;
  text-align: center;
  font-family: Cheque;
  font-weight: 900;
  font-size: 57px;
  line-height: 68px;

  @media ${breakPoints.xl} {
    padding-bottom: 26px;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
    line-height: 48px;
  }

  @media ${breakPoints.sm} {
    padding-bottom: 24px;
    font-size: 24px;
    line-height: 28px;
  }
`;

export const AuthorInfo = styled.div`
  position: relative;
  margin-bottom: 40px;
  display: flex;
  gap: 64px;
  flex-direction: row;
  align-items: flex-start;

  @media ${breakPoints.xl} {
    align-items: center;
    flex-direction: column;
  }

  @media ${breakPoints.lg} {
    margin-bottom: 20px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.sm} {
    margin-bottom: 10px;
    gap: 24px;
  }
`;

export const AuthorPhoto = styled.img`
  height: 320px;
  width: 320px;
  display: block;
  object-fit: cover;
  border-radius: 50%;
  filter: saturate(0%);
  @media ${breakPoints.xl} {
    /* width: 416px; */
    /* height: 416px; */
  }

  @media ${breakPoints.md} {
    margin-right: 0;
  }

  @media ${breakPoints.sm} {
    width: 288px;
    height: 288px;
  }
`;

export const AuthorDescr = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-size: 20px;
  line-height: 29px;
  @media ${breakPoints.xl} {
    align-items: center;
  }
  @media ${breakPoints.md} {
    font-size: 14px;
  }
`;

export const AuthorProps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-size: 30px;
  letter-spacing: 0.03em;
  font-weight: 700;

  @media ${breakPoints.xl} {
    align-items: center;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
    line-height: 22px;
    gap: 12px;
  }

  @media ${breakPoints.sm} {
    font-size: 16px;
    line-height: 20px;
  }
`;

export const AuthorSpeech = styled.p`
  position: relative;
  font-style: italic;
  font-weight: 300;

  @media ${breakPoints.xl} {
    font-size: 20px;
    line-height: 24px;
  }

  @media ${breakPoints.lg} {
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
  line-height: 29px;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    font-size: 16px;
    line-height: 19.5px;
  }

  @media ${breakPoints.sm} {
  }

  @media screen and (max-width: 576px) {
    font-size: 14px;
  }
`;

export const AuthorContacts = styled.div`
  display: flex;
  justify-content: left;
  font-size: 18px;
  line-height: 22px;
  align-self: flex-start;

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
