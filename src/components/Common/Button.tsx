import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components';

export type ButtonProps = {
  text: string,
  className?: string,
  isDisabled?: boolean,
  isLoading?: boolean,
  onClick?: () => void,
}

const Button = React.memo(({
  isDisabled,
  isLoading,
  ...props
}: ButtonProps) => (
  <ButtonWrap>
    <button
      type='button'
      className={classNames(
        'button',
        props.className,
        { isDisabled: isDisabled || isLoading },
      )}
      onClick={!isDisabled && !isLoading ? props.onClick : undefined}
    >
      <span key={0}>{props.text}</span>
    </button>
  </ButtonWrap>
));

export default Button;
// Styles

const ButtonWrap = styled.div`
  .button {
    color: #FFFFFF;
    margin-top: 40px;

    background: transparent;
    border: 1px solid #FFFFFF;
    cursor: pointer;
    transition: all .2s ease-out;

    &:hover {
      color: #930000;
      border: .5px solid rgb(220 220 220 / 50%);
    }

    &.isDisabled {
      cursor: default;

      &:active {
        transform: none;
      }
    }
  }

  .cardButtonBuy {
    width: 320px;
    height: 70px;
  }

  .counterButton {
    width: 70px;
    height: 70px;
    margin-top: 0;
  }
`;
