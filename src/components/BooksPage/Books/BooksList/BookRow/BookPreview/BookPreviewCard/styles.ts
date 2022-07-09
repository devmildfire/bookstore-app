import styled from 'styled-components';
import Button from '@/components/Common/Button';
import VideoPlayer from '@/components/Common/VideoPlayer';

export const StyledWrapper = styled.div`
  --text-content-width: 594px;
  --preview-height: 600px;

  flex-basis: 100%;

  display: grid;
  gap: 66px;

  position: relative;

  height: var(--preview-height);
`;

export const StyledForwardPlan = styled.div`
  position: relative;
  z-index: 1;

  padding: 52px 0;
`;

export const StyledTextBlock = styled.div`
  display: grid;
  gap: 4px;

  height: 100%;
  max-width: calc(var(--text-content-width) - 100px);
`;

export const StyledBackground = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: var(--text-content-width) 1fr;
`;

export const StyledPlayer = styled(VideoPlayer)`
  height: var(--preview-height);
`;

/** TODO: вынести черный в переменные  */
export const StyledShadowElement = styled.div`
  position: absolute;
  inset: 0;

  height: var(--preview-height);
  background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0) 30.73%,
      rgba(0, 0, 0, 0) 72.92%,
      rgba(0, 0, 0, 0.7) 100%
    ),
    linear-gradient(90deg, #000000 3.2%, rgba(0, 0, 0, 0) 58.66%);
`;

export const StyledDescription = styled.div`
  display: grid;

  gap: 1em;

  max-height: 185px;

  overflow: auto;

  padding-right: 37px;
`;

export const StyledButton = styled(Button)`
  align-self: end;
`;
