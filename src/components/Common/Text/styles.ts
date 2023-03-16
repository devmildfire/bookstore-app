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

const h1Style = css<StyledTextProps>`
  font-size: 90px;
  font-weight: ${(props) => props.fontWeight || 900};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h21Style = css<StyledTextProps>`
  font-size: 60px;
  font-weight: ${(props) => props.fontWeight || 900};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.xl} {
    font-size: 60px;
    width: var(--width);
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

const buttonTextStyle = css<StyledTextProps>`
  ${textStyle}
  padding: 0 40px;
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
    padding: 0;
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
  margin: 0 auto;

  position: absolute;
  bottom: 30px;
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
  margin-top: 25px;

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

const styles: Record<
  Variant,
  FlattenInterpolation<ThemedStyledProps<StyledTextProps, any>>
> = {
  h1: h1Style,
  h2_1: h21Style,
  h2_1_LJ: h21LJStyle,
  h2_2: h22Style,
  h3_1: h31Style,
  h3_2: h32Style,
  h3_3: h33Style,
  h3_31: h33StyleAbout,
  h3_32: h33StyleM2B,
  h3_4: h34Style,
  text: textStyle,
  aboutText: aboutTextStyle,
  text_italic: textStyleItalic,
  paddedText: paddedTextStyle,
  buttonText: buttonTextStyle,
  lJbuttonText: lJbuttonTextStyle,
  h4_1: h41Style,
  h4_2: h42Style,
  h4_3: h43Style,
  h4_4: h44Style,
  h4_p: partnerDisplayNameStyle,
  h4_n: h4Name,
};

export const tagMap: Record<Variant, string> = {
  h1: 'h1',
  h2_1: 'h2',
  h2_1_LJ: 'h2',
  h2_2: 'h2',
  h3_1: 'h3',
  h3_2: 'h3',
  h3_3: 'h3',
  h3_31: 'h3',
  h3_32: 'h3',
  h3_4: 'h3',
  text: 'p',
  aboutText: 'p',
  text_italic: 'p',
  paddedText: 'p',
  buttonText: 'p',
  lJbuttonText: 'p',
  h4_1: 'h4',
  h4_2: 'h4',
  h4_3: 'h4',
  h4_4: 'h4',
  h4_p: 'h4',
  h4_n: 'h4',
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
