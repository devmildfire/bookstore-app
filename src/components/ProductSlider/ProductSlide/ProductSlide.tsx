import React, { PropsWithChildren } from 'react';
import { Book } from '@/types/book';

interface ProductSlideProps extends Book {}

const ProductSlide = (
  props: PropsWithChildren<ProductSlideProps>,
): React.ReactElement => {
  const { id } = props;

  return <>{id}</>;
};

export default ProductSlide;
