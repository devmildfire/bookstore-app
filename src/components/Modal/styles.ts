import * as Dialog from '@radix-ui/react-dialog';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

export const DialogOverlay = styled(Dialog.Overlay)`
  background-color: #0000009d;
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

export const DialogContent = styled(Dialog.Content)`
  display: flex;
  justify-content: center;
  background-color: var(--main-black);
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 1100px;
  max-height: 85vh;
  padding: 36px 155px 77px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  :focus {
    outline: none;
  }

  @media ${breakPoints.lg} {
    padding: 32px 64px 32px;
  }

  @media ${breakPoints.sm} {
    padding: 32px 16px 32px;
  }
`;

// const DialogTitle = styled.h2`
//   font-weight: 500;
//   color: var(--mauve12);
//   font-size: 17px;
// `;

// const DialogDescription = styled.p`
//   margin: 10px 0 20px;
//   color: var(--mauve11);
//   font-size: 15px;
//   line-height: 1.5;
// `;
