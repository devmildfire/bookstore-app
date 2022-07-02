import React from 'react';
import StyledInput from './styles';

const Input = (
  // eslint-disable-next-line no-undef
  props: Omit<JSX.IntrinsicElements['input'], 'ref'>,
): React.ReactElement => <StyledInput {...props} />;

export default Input;
