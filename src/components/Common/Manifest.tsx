import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { ClassNameProps } from '../../types/className';
import Text from './Text';

const StyledManifest = styled(Text)`
  position: relative;
  color: #930000;
`;

const Manifest = (
  props: PropsWithChildren<ClassNameProps>,
): React.ReactElement => {
  const { className, children } = props;

  return <StyledManifest className={className}>{children}</StyledManifest>;
};

export default Manifest;
