import React from 'react';
// import styled from 'styled-components';
import { GridDiv } from './styles';

const TwoPaneGrid: React.FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props;
  return <GridDiv>{children}</GridDiv>;
};

export default TwoPaneGrid;
