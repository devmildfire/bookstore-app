import React, { MouseEvent, PropsWithChildren } from 'react';
import styled from 'styled-components';

type IconButtonProps = {
  onClick: (e: MouseEvent) => void;
  label: string;
};

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  border: none;
  background-color: transparent;
  padding: 8px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s ease-out;
  color: var(--main-white-80);
  &:hover {
    color: var(--main-red-100);
  }

  span.ripple {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    transform: scale(0);
    animation: grow 600ms ease-out;
    background-color: var(--main-red-10);

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
  width: max-content;
  height: max-content;
  z-index: 2;
  & > svg {
    display: flex;
    width: clamp(16px, 4vw, 24px);
    height: clamp(16px, 4vw, 24px);
  }
`;

export function IconButton({
  children,
  label,
  onClick,
}: PropsWithChildren<IconButtonProps>) {
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
    <Button aria-label={label} onClick={handleClick}>
      <IconContainer>{children}</IconContainer>
    </Button>
  );
}
