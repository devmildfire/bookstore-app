import styled, {
  css,
  FlattenInterpolation,
  ThemedStyledProps,
} from 'styled-components';
import { Property } from 'csstype';
import breakPoints from '@/utils/breakPoints';
import { Color, FontFamily, Variant } from './types';

const fontFamilies: Record<string, string> = {
  sans: "'Montserrat', sans-serif",
  serif: "'Cheque', serif",
};

const colors: Record<Color, string> = {
  inherit: 'inherit',
  red: 'var(--main-red-100)',
  white: 'var(--main-white-100)',
  white80: 'var(--main-white-80)',
};

//  Стили, которые останутся

const ClampedH1Style = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 900};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  font-size: clamp(24px, 1.625vw + 18.8px, 50px);
  max-width: var(--text-max-width);

  padding-bottom: var(--first-title-gap);
`;

const ClampedH2TextStyle = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: clamp(18px, 1.375vw + 15.6px, 40px);
  max-width: var(--text-max-width);

  padding-bottom: var(--first-title-gap);
`;

const ClampedH3TextStyle = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: clamp(16px, 0.5vw + 14.4px, 24px);
  max-width: var(--text-max-width);
`;

const ClampedH4TextStyle = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: clamp(16px, 0.25vw + 15.2px, 20px);
  max-width: var(--text-max-width);
`;

const ClampedBasicTextStyle = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: clamp(14px, 0.25vw + 13.2px, 18px);
  max-width: var(--text-max-width);
`;

//  Дальше идут стили, от всех из которых мы в какой-то момент избавимся

const h1Style = css<StyledTextProps>`
  font-size: 90px;
  font-weight: ${(props) => props.fontWeight || 900};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h1_InvStyle = css<StyledTextProps>`
  ${h1Style}
  font-weight: ${(props) => props.fontWeight || 600};
  font-size: 60px;
  line-height: 84px;

  @media screen and (max-width: 1600px) {
    font-size: 50px;
  }

  @media ${breakPoints.xl} {
    font-size: 50px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 40px;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
  }

  @media ${breakPoints.md} {
    font-size: 20px;
  }

  @media ${breakPoints.smd} {
    font-size: 20px;
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
  }
`;

const h21Style = css<StyledTextProps>`
  font-size: 60px;
  font-weight: ${(props) => props.fontWeight || 900};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.xl} {
    font-size: 60px;
    max-width: var(--width);
    width: 100%;
    margin: 0 auto;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
  }

  @media ${breakPoints.smd} {
    font-size: 30px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h21HalStyle = css<StyledTextProps>`
  ${h21Style}
  font-size: 40px;

  @media ${breakPoints.xxl} {
    font-size: 40px;
  }

  @media ${breakPoints.lg} {
    font-size: 30px;
  }

  @media ${breakPoints.smd} {
    font-size: 24px;
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
  }
`;

const h21CartStyle = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: 40px;
  text-align: left;

  @media ${breakPoints.xxl} {
    font-size: 30px;
  }

  @media ${breakPoints.lg} {
    font-size: 24px;
  }

  @media ${breakPoints.smd} {
    font-size: 20px;
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
    text-align: center;
  }
`;

// Это специальный стиль для заголовка блока литжурнала на странице О Чтиве
const h21LJStyle = css<StyledTextProps>`
  ${h21Style}
  max-width: calc(0.9*var(--box-width));
  font-size: 70px;
  line-height: 1.2em !important;

  @media ${breakPoints.xxl} {
    font-size: 50px;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
  }

  @media ${breakPoints.smd} {
    font-size: 30px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h22Style = css<StyledTextProps>`
  ${h21Style}
  font-size: 50px;

  @media ${breakPoints.sm} {
    font-size: 22px;
  }
`;

const h31Style = css<StyledTextProps>`
  font-size: 40px;
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.lg} {
    font-size: 32px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h32Style = css<StyledTextProps>`
  ${h31Style}
  font-size: 30px;

  @media ${breakPoints.lg} {
    font-size: 28px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h33Style = css<StyledTextProps>`
  ${h31Style}
  font-size: 24px;

  @media ${breakPoints.lg} {
    font-size: 16px;
  }

  @media ${breakPoints.sm} {
    font-size: 14px;
  }
`;

const h3Abzac = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 700};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: 40px;
  text-align: left;
  /* align-self: flex-start; */

  @media ${breakPoints.xl} {
    font-size: 30px;
  }

  @media ${breakPoints.lg} {
    font-size: 20px;
  }
`;

const nameAbzac = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 700};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  font-size: 24px;
  text-align: left;
  /* align-self: flex-start; */

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
  }
`;

const h33StyleAbout = css<StyledTextProps>`
  font-size: 24px;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.xl} {
    font-size: 24px;
    text-transform: none;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
    text-transform: uppercase;
    /* text-transform: 'none'; */
  }

  @media ${breakPoints.md} {
    font-size: 14px;
    text-transform: uppercase;
    /* text-transform: 'none'; */
  }

  @media ${breakPoints.smd} {
    font-size: 14px;
    text-transform: uppercase;
    /* text-transform: 'none'; */
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
    text-transform: uppercase;
    /* text-transform: 'none'; */
  }
`;

const h33StyleM2B = css<StyledTextProps>`
  font-size: 50px;
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.xl} {
    font-size: 40px;
    text-transform: none;
  }

  @media ${breakPoints.lg} {
    font-size: 30px;
    /* text-transform: 'none'; */
  }

  @media ${breakPoints.md} {
    font-size: 24px;
    /* text-transform: 'none'; */
  }

  @media ${breakPoints.smd} {
    font-size: 20px;
    /* text-transform: 'none'; */
  }

  @media ${breakPoints.sm} {
    font-size: 18px;
    /* text-transform: 'none'; */
  }
`;

const h34Style = css<StyledTextProps>`
  ${h33Style}
  font-weight: ${(props) => props.fontWeight || 400};
`;

const textStyle = css<StyledTextProps>`
  /* font-size: 20px; */
  font-size: 18px;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.lg} {
    font-size: 16px;
  }

  @media ${breakPoints.smd} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 14px;
  }

  a {
    text-decoration: underline;
    :hover {
      color: var(--main-red-100);
    }
  }
`;

const aboutTextStyle = css<StyledTextProps>`
  /* font-size: 20px; */
  font-size: 18px;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.lg} {
    font-size: 16px;
  }

  @media ${breakPoints.smd} {
    font-size: 12px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
  }
`;

const textStyleItalic = css<StyledTextProps>`
  font-style: italic;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};
  font-size: 16px;

  @media ${breakPoints.lg} {
    font-size: 14px;
  }

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.smd} {
    font-size: 12px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
  }
`;

const paddedTextStyle = css<StyledTextProps>`
  ${textStyle}
  padding: 0 40px;

  @media ${breakPoints.xl} {
    padding: 0 30px;
  }

  @media ${breakPoints.lg} {
    padding: 0 25px;
  }

  @media ${breakPoints.md} {
    padding: 0 20px;
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    padding: 0 20px;
    font-size: 10px;
  }
`;

const abzacTextStyle = css<StyledTextProps>`
  ${textStyle}
  font-size: 24px;

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
  }

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
  }
`;

const abzacCardStyle = css<StyledTextProps>`
  ${textStyle}
  font-size: 20px;

  @media ${breakPoints.xl} {
    font-size: 16px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 14px;
  }

  @media ${breakPoints.lg} {
    font-size: 14px;
  }
`;

const buttonTextStyle = css<StyledTextProps>`
  ${textStyle}
  font-size: 16px;

  @media ${breakPoints.xl} {
    /* padding: 0 30px; */
  }

  @media ${breakPoints.lg} {
    font-size: 12px;
    /* padding: 0 25px; */
  }

  @media ${breakPoints.md} {
    /* padding: 0 20px; */
    font-size: 12px;
  }

  @media ${breakPoints.smd} {
    /* padding: 0 20px; */
    font-size: 10px;
  }

  @media ${breakPoints.sm} {
    /* padding: 0 20px; */
    font-size: 10px;
  }
`;

const lJbuttonTextStyle = css<StyledTextProps>`
  ${textStyle}
  padding: 0;
  font-size: 16px;

  @media ${breakPoints.xxl} {
    font-size: 12px;
    /* padding: 0 30px; */
  }

  @media ${breakPoints.lg} {
    font-size: 10px;
    /* padding: 0 25px; */
  }

  @media ${breakPoints.md} {
    /* padding: 0 20px; */
    /* font-size: 12px; */
  }

  @media ${breakPoints.smd} {
    /* padding: 0 20px; */
    /* font-size: 10px; */
  }

  @media ${breakPoints.sm} {
    /* padding: 0 20px; */
    /* font-size: 10px; */
  }
`;

const h41Style = css<StyledTextProps>`
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};
  font-size: 16px;

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 10px;
  }
`;

const navItemStyle = css<StyledTextProps>`
  ${h41Style}
  font-size: 14px;

  @media screen and (max-width: 1600px) {
    font-size: 12px;
  }

  @media ${breakPoints.xl} {
    font-size: 12px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 10px;
  }

  @media ${breakPoints.lg} {
    font-size: 10px;
  }
`;

const h42Style = css<StyledTextProps>`
  ${h41Style}
  font-size: 12px;

  @media ${breakPoints.sm} {
    font-size: 8px;
  }
`;

const h43Style = css<StyledTextProps>`
  ${h41Style}
  font-size: 12px;

  @media ${breakPoints.md} {
    font-size: 10px;
  }

  @media ${breakPoints.sm} {
    font-size: 8px;
  }
`;

const h44Style = css<StyledTextProps>`
  ${h41Style}
  font-size: 16px;

  @media ${breakPoints.lg} {
    font-size: 14px;
  }

  @media ${breakPoints.smd} {
    font-size: 12px;
  }

  @media ${breakPoints.sm} {
    font-size: 12px;
  }
`;

const partnerDisplayNameStyle = css<StyledTextProps>`
  ${h41Style}

  left: 0;
  right: 0;
  margin: auto auto 10%;

  // position: absolute;
  // bottom: 30px;
  grid-area: 1/2;
  /* justify-self: center; */

  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;

  @media ${breakPoints.lg} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 8px;
  }
`;

const h4Name = css<StyledTextProps>`
  ${h41Style}
  font-size: 18px;

  @media ${breakPoints.lg} {
    font-size: 16px;
  }

  @media ${breakPoints.smd} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 14px;
  }
`;

const sideNavItemStyle = css<StyledTextProps>`
  ${textStyle}
  font-size: 24px;

  @media screen and (max-width: 1600px) {
    font-size: 20px;
  }

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 20px;
  }

  @media ${breakPoints.lg} {
    font-size: 20px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.sm} {
    font-size: 14px;
  }
`;

const sideNavTitleStyle = css<StyledTextProps>`
  ${h41Style}
  font-weight: ${(props) => props.fontWeight || 700};
  font-size: 40px;

  @media ${breakPoints.xl} {
    font-size: 30px;
  }

  @media ${breakPoints.lg} {
    font-size: 30px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.sm} {
    font-size: 20px;
  }
`;

const courseTitleStyle = css<StyledTextProps>`
  ${h41Style}
  font-weight: ${(props) => props.fontWeight || 700};
  font-size: 30px;

  @media ${breakPoints.xl} {
    font-size: 24px;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.sm} {
    font-size: 16px;
  }
`;

const h31ManuscriptStyle = css<StyledTextProps>`
  font-size: 60px;
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media screen and (max-width: 1600px) {
    font-size: 50px;
  }

  @media ${breakPoints.xl} {
    font-size: 50px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 40px;
  }

  @media ${breakPoints.lg} {
    font-size: 40px;
  }

  @media screen and (max-width: 900px) {
    font-size: 20px;
  }

  @media ${breakPoints.md} {
    font-size: 20px;
  }

  @media ${breakPoints.sm} {
  }
`;

const ManuscriptTextStyle = css<StyledTextProps>`
  ${textStyle}
  font-size: 20px;

  a {
    text-decoration: none;
    color: var(--main-red-100);

    :hover {
      text-decoration: underline;
      color: red;
    }
  }

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 18px;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
  }

  @media screen and (max-width: 900px) {
    font-size: 18px;
  }

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
  }
`;

const ManuscriptIconStyle = css<StyledTextProps>`
  ${textStyle}
  font-size: 24px;

  @media screen and (max-width: 1600px) {
    font-size: 20px;
  }

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 18px;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
  }

  @media screen and (max-width: 900px) {
    font-size: 16px;
  }

  @media ${breakPoints.md} {
    font-size: 16px;
  }

  @media ${breakPoints.sm} {
  }
`;

const h31BelieveStyle = css<StyledTextProps>`
  font-size: 30px;
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.xl} {
    font-size: 30px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 20px;
  }

  @media ${breakPoints.lg} {
    font-size: 20px;
  }

  @media screen and (max-width: 900px) {
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.sm} {
  }
`;

const h31SendManStyle = css<StyledTextProps>`
  font-size: 24px;
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media screen and (max-width: 1200px) {
    font-size: 20px;
  }

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 16px;
  }

  @media ${breakPoints.lg} {
    font-size: 16px;
  }

  @media screen and (max-width: 900px) {
    font-size: 14px;
  }

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
  }
`;

const h31ManRecStyle = css<StyledTextProps>`
  font-size: 24px;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.xl} {
    font-size: 20px;
  }

  @media screen and (max-width: 1200px) {
    font-size: 18px;
  }

  @media ${breakPoints.lg} {
    font-size: 18px;
  }

  @media screen and (max-width: 900px) {
  }

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
  }
`;

const styles: Record<
  Variant,
  FlattenInterpolation<ThemedStyledProps<StyledTextProps, any>>
> = {
  h1c: ClampedH1Style,
  h2c: ClampedH2TextStyle,
  h3c: ClampedH3TextStyle,
  h4c: ClampedH4TextStyle,
  h1: h1Style,
  h1_Inv: h1_InvStyle,
  h2_1: h21Style,
  h2_1_LJ: h21LJStyle,
  h2_1_Cart: h21CartStyle,
  h2_1_HAL: h21HalStyle,
  h2_2: h22Style,
  h3_1: h31Style,
  h3_1Man: h31ManuscriptStyle,
  h3_1Bel: h31BelieveStyle,
  h3_1SendMan: h31SendManStyle,
  h3_2: h32Style,
  h3_3: h33Style,
  h3_31: h33StyleAbout,
  h3_32: h33StyleM2B,
  h3_4: h34Style,
  manRec: h31ManRecStyle,
  text: textStyle,
  ctext: ClampedBasicTextStyle,
  aboutText: aboutTextStyle,
  manIcon: ManuscriptIconStyle,
  manText: ManuscriptTextStyle,
  text_italic: textStyleItalic,
  paddedText: paddedTextStyle,
  buttonText: buttonTextStyle,
  lJbuttonText: lJbuttonTextStyle,
  abzacText: abzacTextStyle,
  abzacCardText: abzacCardStyle,
  sn_Item: sideNavItemStyle,
  sn_Title: sideNavTitleStyle,
  courseBig: courseTitleStyle,
  h3_Abzac: h3Abzac,
  h4_Abzac: nameAbzac,
  h4_1: h41Style,
  h4_2: h42Style,
  h4_3: h43Style,
  h4_4: h44Style,
  h4_p: partnerDisplayNameStyle,
  h4_n: h4Name,
  h4_nav: navItemStyle,
};

export const tagMap: Record<Variant, string> = {
  h1c: 'h1',
  h2c: 'h2',
  h3c: 'h3',
  h4c: 'h4',
  h1: 'h1',
  h1_Inv: 'h1',
  h2_1: 'h2',
  h2_1_LJ: 'h2',
  h2_1_HAL: 'h2',
  h2_1_Cart: 'h2',
  h2_2: 'h2',
  h3_1: 'h3',
  h3_1Man: 'h3',
  h3_1Bel: 'h3',
  h3_2: 'h3',
  h3_3: 'h3',
  h3_31: 'h3',
  h3_32: 'h3',
  h3_4: 'h3',
  ctext: 'p',
  text: 'p',
  aboutText: 'p',
  text_italic: 'p',
  manText: 'p',
  manIcon: 'p',
  paddedText: 'p',
  buttonText: 'p',
  lJbuttonText: 'p',
  abzacText: 'p',
  abzacCardText: 'p',
  sn_Item: 'p',
  manRec: 'p',
  h3_Abzac: 'h3',
  h4_Abzac: 'h4',
  sn_Title: 'h3',
  courseBig: 'h4',
  h3_1SendMan: 'h3',
  h4_1: 'h4',
  h4_2: 'h4',
  h4_3: 'h4',
  h4_4: 'h4',
  h4_p: 'h4',
  h4_n: 'h4',
  h4_nav: 'h4',
};

export interface StyledTextProps {
  readonly align: Property.TextAlignLast;
  readonly variant: Variant;
  readonly textColor: Color;
  readonly textTransform?: Property.TextTransform;
  readonly fontFamily?: FontFamily;
  readonly fontWeight?: Property.FontWeight;
  readonly fontStyle?: Property.FontStyle;
}

const StyledText = styled.span`
  ${(props: StyledTextProps) => styles[props.variant]}
  color: ${(props: StyledTextProps) => colors[props.textColor]};
  line-height: 1.4;
  letter-spacing: 0.03em;
  text-align: ${(props) => props.align};
`;

export default StyledText;
