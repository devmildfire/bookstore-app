import * as React from 'react';
import useScrollLock from '@/hooks/useScrollLock';
import BookWorm from '../Common/BookWormLoader';
import Overlay from '../Common/Overlay';

type Props = {
  show: boolean;
};

const PageLoading: React.FC<Props> = ({ show }) => {
  useScrollLock(true);
  return (
    <Overlay show={show}>
      <BookWorm variant='red' size='180px' />
    </Overlay>
  );
};

export default React.memo(PageLoading);
