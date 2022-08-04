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
  white: 'var(--main-white)',
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

const h34Style = css<StyledTextProps>`
  ${h33Style}
  font-weight: ${(props) => props.fontWeight || 400};
`;

const textStyle = css<StyledTextProps>`
  font-size: 20px;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.lg} {
    font-size: 16px;
  }
  @media ${breakPoints.sm} {
    font-size: 14px;
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

const styles: Record<
  Variant,
  FlattenInterpolation<ThemedStyledProps<StyledTextProps, any>>
> = {
  h1: h1Style,
  h2_1: h21Style,
  h2_2: h22Style,
  h3_1: h31Style,
  h3_2: h32Style,
  h3_3: h33Style,
  h3_4: h34Style,
  text: textStyle,
  h4_1: h41Style,
  h4_2: h42Style,
  h4_3: h43Style,
};

export const tagMap: Record<Variant, string> = {
  h1: 'h1',
  h2_1: 'h2',
  h2_2: 'h2',
  h3_1: 'h3',
  h3_2: 'h3',
  h3_3: 'h3',
  h3_4: 'h3',
  text: 'p',
  h4_1: 'h4',
  h4_2: 'h4',
  h4_3: 'h4',
};

export interface StyledTextProps {
  readonly align: Property.TextAlignLast;
  readonly variant: Variant;
  readonly textColor: Color;
  readonly textTransform?: Property.TextTransform;
  readonly fontFamily?: FontFamily;
  readonly fontWeight?: Property.FontWeight;
}

const StyledText = styled.span`
  color: ${(props: StyledTextProps) => colors[props.textColor]};
  line-height: 1.2em;
  letter-spacing: 0.03em;
  text-align: ${(props) => props.align};
  ${(props: StyledTextProps) => styles[props.variant]}
`;

export default StyledText;
