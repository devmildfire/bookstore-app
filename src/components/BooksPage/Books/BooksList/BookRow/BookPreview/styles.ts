import styled from 'styled-components';
import Preview from '@/components/Common/Preview';
import PreviewContent from '@/components/Common/PreviewContent';

export const StyledPreview = styled(Preview)`
  width: min(100vw, var(--max-width));
  margin: 0 auto;
`;

export const StyledPreviewContent = styled(PreviewContent)`
  padding-left: 318px;

  height: 600px;

  margin: 0;
`;
