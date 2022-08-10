import * as React from 'react';
import { ClassNameProps } from '@/types/className';

interface LoadingIndicatorProps extends ClassNameProps {
  readonly isLoading: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = (props) => {
  console.log(props);
  return null;
};

export default React.memo(LoadingIndicator);
