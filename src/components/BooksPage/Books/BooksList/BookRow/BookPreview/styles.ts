import styled from 'styled-components';
import PreviewContent from '@/components/Common/PreviewContent';
import PreviewHeader from '@/components/Common/PreviewHeader';

export const StyledPreviewHeader = styled(PreviewHeader)`
  max-width: min(100vw, var(--max-width));
`;

export const StyledPreviewContent = styled(PreviewContent)`
  height: 600px;
  padding-left: 318px;
  margin: 0 auto;
`;
