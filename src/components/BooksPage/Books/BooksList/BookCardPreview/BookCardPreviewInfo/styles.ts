import styled from 'styled-components';
import Button from '@/components/Common/Button';

export const StyledWrapper = styled.div`
  flex-basis: 100%;

  display: grid;
  grid-template-columns: 530px 1fr;
  gap: 66px;

  height: 600px;
`;

export const StyledTextBlock = styled.div`
  display: grid;
  gap: 4px;

  margin: 52px 0;
  padding-left: 58px;
`;

/** TODO: сделать универсальный компонент видео */
export const StyledTrailer = styled.object`
  height: 100%;
  width: 100%;
`;

export const StyledDescription = styled.div`
  display: grid;

  gap: 1em;

  max-height: 185px;

  overflow: auto;

  scroll-padding: 30px;
`;

export const StyledButton = styled(Button)`
  align-self: end;
`;
