import styled from 'styled-components';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';
import Logo from '@/assets/icons/footer-logo.svg';

export const StyleWrapper = styled.footer`
  display: flex;
  flex-direction: column;
  /* width: 100%; */
  width: revert;
  color: var(--main-white-100);
  padding: 0;
`;

export const FooterContent = styled.div`
  padding: 30px 10vw 40px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin: 0 auto;
  width: 100%;
  /* max-width: 1394px; */

  @media ${breakPoints.xl} {
    /* max-width: 1024px; */
  }

  @media ${breakPoints.lg} {
    /* max-width: 768px; */
  }

  @media ${breakPoints.md} {
    /* max-width: 576px; */
    flex-wrap: wrap;
    align-items: center;
  }

  @media ${breakPoints.sm} {
    flex-direction: column;
    padding: 10px 0px 25px;
  }
`;

export const FooterContacts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding-top: 64px;

  @media ${breakPoints.md} {
    padding: 0;
  }

  @media ${breakPoints.sm} {
    text-align: center;
    margin-bottom: 30px;
  }
`;

export const FooterContact = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-weight: 600;
`;

export const FooterContactLink = styled.a`
  display: flex;
  gap: 20px;
  flex-direction: row;
  align-items: center;

  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;

  color: #dcdcdc;
`;

export const FooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  translate: -29.5px;

  @media ${breakPoints.md} {
    width: 100%;
    order: -1;
    margin-bottom: 20px;
    translate: revert;
  }
`;

export const FooterTitle = styled(Text)`
  margin-bottom: 15px;

  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-size: 50px;
  line-height: 61px;

  @media ${breakPoints.sm} {
    font-size: 40px;
    line-height: 49px;
  }
`;

export const FooterSocials = styled.ul`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const Icon = styled.svg`
  color: var(--main-white-100);
  transition: all 0.3s ease-in-out;

  :hover {
    color: var(--main-red-100);
  }
`;

export const ContactIcon = styled.svg`
  stroke: var(--main-white-100);
`;

export const FooterLogoLink = styled.a`
  margin-top: 56px;
  display: flex;

  @media ${breakPoints.md} {
    margin: 0;
  }
`;

export const FooterLogo = styled(Logo)`
  margin-right: 17px;
`;

export const FooterLogoText = styled.p`
  display: grid;
`;

export const FooterCopyright = styled.div`
  // width: 100vw;
  width: 100%;
  padding: 15px 0;
  font-feature-settings: 'salt' on, 'liga' off;
  border-top: 1px solid rgba(220, 220, 220, 0.2);
  max-width: unset;

  @media ${breakPoints.sm} {
    padding: 10px 0;
  }
`;

export const CopyrightContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 10vw;
  box-sizing: content-box;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;
