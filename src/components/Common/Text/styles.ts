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

const h2Style = css<StyledTextProps>`
  font-size: 60px;
  font-weight: ${(props) => props.fontWeight || 900};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const h3Style = css<StyledTextProps>`
  font-size: 40px;
  font-weight: ${(props) => props.fontWeight || 700};
  text-transform: ${(props) => props.textTransform || 'uppercase'};
  font-family: ${(props) => props.fontFamily || fontFamilies.serif};

  @media ${breakPoints.lg} {
    font-size: 32px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const pStyle = css<StyledTextProps>`
  font-size: 24px;
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

const spanStyle = css<StyledTextProps>`
  font-size: 18px;
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

const body1Style = css<StyledTextProps>`
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

const body2Style = css<StyledTextProps>`
  font-size: 12px;
  font-weight: ${(props) => props.fontWeight || 400};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.sm} {
    font-size: 8px;
  }
`;

const subtitle1Style = css<StyledTextProps>`
  font-size: 20px;
  font-weight: ${(props) => props.fontWeight || 600};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.md} {
    font-size: 18px;
  }

  @media ${breakPoints.sm} {
    font-size: 16px;
  }
`;

const subtitle2Style = css<StyledTextProps>`
  font-size: 18px;
  font-weight: ${(props) => props.fontWeight || 500};
  text-transform: ${(props) => props.textTransform || 'normal'};
  font-family: ${(props) => props.fontFamily || fontFamilies.sans};

  @media ${breakPoints.md} {
    font-size: 14px;
  }

  @media ${breakPoints.sm} {
    font-size: 10px;
  }
`;

const styles: Record<
  Variant,
  FlattenInterpolation<ThemedStyledProps<StyledTextProps, any>>
> = {
  h1: h1Style,
  h2: h2Style,
  h3: h3Style,
  p: pStyle,
  span: spanStyle,
  body1: body1Style,
  body2: body2Style,
  subtitle1: subtitle1Style,
  subtitle2: subtitle2Style,
};

export const tagMap: Record<Variant, string> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body1: 'p',
  body2: 'span',
  p: 'p',
  span: 'span',
  subtitle1: 'h6',
  subtitle2: 'h6',
};

export interface StyledTextProps {
  readonly align: Property.TextAlignLast;
  readonly variant: Variant;
  readonly color: Color;
  readonly textTransform?: Property.TextTransform;
  readonly fontFamily?: FontFamily;
  readonly fontWeight?: Property.FontWeight;
}

const StyledText = styled.span`
  color: ${(props: StyledTextProps) => colors[props.color]};
  line-height: 1.2em;
  text-align: ${(props) => props.align};
  ${(props: StyledTextProps) => styles[props.variant]}
`;

export default StyledText;
