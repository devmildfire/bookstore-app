import styled from 'styled-components';
import Image from '@/components/Common/Image';
import List from '@/components/Common/List';

export const StyledWrapper = styled.div`
  display: grid;
  grid-template-rows: 244px 1fr;

  min-height: 1002px;
  width: 445px;

`;

export const StyledImage = styled(Image)`
  background-color: var(--key);
`;

export const StyledDescriptionWrapper = styled.div`
  display: grid;
  grid-template-rows: min-content 1fr min-content min-content;
  gap: 34px;
  justify-items: center;

  padding: 70px 80px 36px;

  background: linear-gradient(
    341.86deg,
    var(--main-black) 12.37%,
    var(--key) 87.69%
  );
`;

export const StyledFeaturesList = styled(List)`
  gap: 34px;

  height: max-content;
`;

export const StyledFeature = styled.li`
  position: relative;

  ::before {
    content: '';

    position: absolute;
    top: baseline;
    left: -25px;

    display: inline-block;

    width: 10px;
    height: 10px;

    background-color: var(--main-red-100);

    border-radius: 50%;

    transform: translateY(50%);
  }
`;

export const StyledPriceWrapper = styled.div`
  display: inherit;
  justify-items: inherit;
`;
