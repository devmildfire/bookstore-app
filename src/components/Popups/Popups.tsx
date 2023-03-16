import * as React from 'react';
import { POPUPS } from '@/consts/popups';
import { BasePopupProps } from '@/types/popups';
import usePopups from './hooks/usePopups';
import AddBasketBookPopup from './AddBasketBookPopup';
import useScrollLock from '@/hooks/useScrollLock';

const popupsMap: Record<string, React.ComponentType<BasePopupProps>> = {
  [POPUPS.addBasketBook]: AddBasketBookPopup,
};

const Popups: React.FC = () => {
  const { mountedPopups, popups } = usePopups();

  const popupsCount = mountedPopups.length;
  useScrollLock(!!popupsCount);

  return (
    <React.Fragment key='unique'>
      {mountedPopups.map((popupKey, i) => {
        const Component = popupsMap[popupKey];

        if (!Component) {
          return null;
        }

        return (
          <Component
            isOpen={popups.includes(popupKey)}
            isFocus={popupsCount - 1 === i}
          />
        );
      })}
    </React.Fragment>
  );
};
export default Popups;
