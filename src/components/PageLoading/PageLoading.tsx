import * as React from 'react';
import useScrollLock from '@/hooks/useScrollLock';
import LoadingIndicator from '../Common/LoadingIndicator';
import Overlay from '../Common/Overlay';

const PageLoading: React.FC = () => {
  useScrollLock(true);
  return (
    <Overlay>
      <LoadingIndicator />
    </Overlay>
  );
};

export default React.memo(PageLoading);
