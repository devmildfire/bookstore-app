import styled from 'styled-components';
import Container from '@/components/Common/Container';
import breakPoints from '@/utils/breakPoints';

export const StyledProductsList = styled.div`
  display: grid;

  row-gap: 100px;

  @media ${breakPoints.sm} {
    row-gap: 50px;
  }
`;

export const StyledRowWrapper = styled.div`
  display: grid;
  gap: 30px;
`;

export const StyledPreviewContainer = styled(Container)`
  width: calc(var(--width) + var(--main-margin));
  max-width: calc(var(--max-width) - (var(--max-width) - var(--width)) / 2);
  margin-right: 0;
`;
