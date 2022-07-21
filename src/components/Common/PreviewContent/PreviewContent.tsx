import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Container from '../Container';

const PreviewContent: React.FC<ClassNameProps> = (props) => {
  const { children, className } = props;

  return (
    <main>
      <Container className={className}>{children}</Container>
    </main>
  );
};

export default PreviewContent;
