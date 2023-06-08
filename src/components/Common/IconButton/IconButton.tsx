import React, { MouseEvent, PropsWithChildren, useRef } from 'react';
import styled from 'styled-components';

type IconButtonProps = { onClick: (e: MouseEvent) => void };

const Button = styled.button`
  display: flex;
  position: relative;
  overflow: hidden;
  border: none;
  background-color: transparent;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s ease-out;

  &:hover {
    /* background-color: rgba(10, 10, 10, 1); */
    color: var(--main-red-100);
  }

  span.ripple {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    transform: scale(0);
    animation: grow 600ms ease-out;
    background-color: var(--main-white-10);

    @keyframes grow {
      to {
        transform: scale(3);
        opacity: 0;
      }
    }
  }
`;

const IconContainer = styled.div`
  display: flex;
  position: relative;
  z-index: 2;
`;

export function IconButton({
  children,
  onClick,
}: PropsWithChildren<IconButtonProps>) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const circle = document.createElement('span');
    const buttonBox = button.getBoundingClientRect();
    const diameter = Math.max(buttonBox.width, buttonBox.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.top = `${event.clientY - buttonBox.top - radius}px`;
    circle.style.left = `${event.clientX - buttonBox.left - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
    onClick(event);
  };

  return (
    <Button ref={buttonRef} onClick={handleClick}>
      <IconContainer>{children}</IconContainer>
    </Button>
  );
}
