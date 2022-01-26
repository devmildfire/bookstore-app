import React, { memo } from 'react';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';

export type IconProps = {
  src: string,
}

const ReactSVGStyled = styled(ReactSVG)`
  & > div {
    display: flex;
  }
`;

const Icon = ({ src, ...rest }: IconProps) => (
  <ReactSVGStyled src={src} {...rest} />
);

export default memo(Icon);
