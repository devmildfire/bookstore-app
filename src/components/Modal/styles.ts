import * as Dialog from '@radix-ui/react-dialog';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import { motion } from 'framer-motion';

export const DialogOverlay = styled(Dialog.Overlay)<{ open: boolean }>`
  background-color: #0e0e0e99;
  backdrop-filter: blur(8px);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

export const DialogContent = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(115deg, #0b0b0b 3%, rgba(18, 18, 18, 1) 100%);
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  position: fixed;
  overflow: hidden;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  max-width: 850px;
  min-width: 290px;
  max-height: 95vh;
  padding: 45px 45px 55px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  :focus {
    outline: none;
  }
  ::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeAgMAAABGXkYxAAAADFBMVEUAAABERkRMSkxEQkSWVx/1AAAAAXRSTlMAQObYZgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAK5JREFUGJUtTjkOwkAM9BPdzK6MFCmN00G3dPwhjSPxAL7AO9KkSAEPoKegY9awzY7m8Iw0mwoQKjActwtUYgN+DAJkZ9nIODCKoWs2yhV7MTxVhi4EuplnvKhURwxuq+xT1xiP/E2l9MPtQeAoDZnK9wfWwQFmySyv+08y31kxChsGSqs0VHZx4e2cU1fGGxZsmgDNZsZpqd4X0uFsj6x/Z5d/UFVOlqtVPCJnfAG0UWEcWq11IwAAAABJRU5ErkJggg==');
    mix-blend-mode: overlay;
    opacity: 0.8;
  }
  @media ${breakPoints.lg} {
    padding: 32px;
  }

  @media ${breakPoints.md} {
    max-width: 450px;
  }

  @media ${breakPoints.sm} {
    padding: 16px;
  }

  @media screen and (orientation: landscape) and (max-width: 883px) {
    max-width: 85vw;
  }
`;
