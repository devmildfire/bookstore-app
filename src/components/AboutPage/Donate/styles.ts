// import styled from 'styled-components';
// import Text from '@/components/Common/Text';

// const StyledDonateText = styled(Text)`
//   max-width: max-content;
//   /* TODO избавиться от фиксированной высоты блока */
//   height: 740px;
//   margin: 0 auto;
// `;

// export default StyledDonateText;

import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';

const StyledWrapper = styled.section`
  display: grid;
  gap: 64px;

  @media ${breakPoints.xl} {
    gap: 50px;
  }

  @media ${breakPoints.lg} {
    gap: 40px;
  }

  @media ${breakPoints.md} {
    gap: 30px;
  }

  @media ${breakPoints.sm} {
    gap: 30px;
  }
`;

export default StyledWrapper;
