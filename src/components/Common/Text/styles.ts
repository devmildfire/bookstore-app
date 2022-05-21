import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import breakPoints from '../../../utils/breakPoints';
import { Align, FontFamily, Variant } from './types';

const fontWeights: Record<string, number> = {
  h2: 900,
  h3: 700,
};

const fontFamilies: Record<string, string> = {
  sans: "'Montserrat', sans-serif",
  serif: "'Cheque', serif",
};

export interface StyledTextProps {
  align: Align;
  variant: Variant;
  fontFamily: FontFamily;
}

const h2Font = css`
  font-size: 60px;

  @media ${breakPoints.sm} {
    font-size: 24px;
  }
`;

const pFont = css`
  font-size: 24px;

  @media ${breakPoints.sm} {
    font-size: 14px;
  }
`;

const spanFont = css`
  font-size: 18px;

  @media ${breakPoints.lg} {
    font-size: 16px;
  }
  @media ${breakPoints.sm} {
    font-size: 10px;
  }
`;

const fontSizes: Record<string, FlattenSimpleInterpolation> = {
  h2: h2Font,
  p: pFont,
  span: spanFont,
  // body1: 14,
  // body2: 12,
};

const StyledText = styled('span')`
  line-height: 1.2em;
  font-weight: ${(props: StyledTextProps) => fontWeights[props.variant || 'body1'] || 400};
  text-align: ${(props: StyledTextProps) => props.align};
  font-family: ${(props: StyledTextProps) => fontFamilies[props.fontFamily || 'sans']};
  ${(props: StyledTextProps) => fontSizes[props.variant]}
`;

export default StyledText;
