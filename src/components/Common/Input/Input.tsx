import React from 'react';
import styled from 'styled-components';
import breakPoints from '../../../utils/breakPoints';

const StyledInput = styled.input`
  width: 400px;
  padding: 25px;

  border-radius: 4px;
  border: 1px solid white;

  background-color: #dcdcdc;

  :disabled {
    background-color: #767676;
  }

  :focus {
    border-color: #121212;
  }

  :placeholder {
    font-size: 16px;
    line-height: 1.2em;
  }

  @media ${breakPoints.sm} {
    padding: 14px;
    width: 250px;
  }
`;

const Input = (
  // eslint-disable-next-line no-undef
  props: Omit<JSX.IntrinsicElements['input'], 'ref'>,
): React.ReactElement => <StyledInput {...props} />;

export default Input;
