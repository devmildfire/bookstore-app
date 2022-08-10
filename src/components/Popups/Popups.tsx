import * as React from 'react';
import { POPUPS } from '@/consts/popups';
import { BasePopupProps } from '@/types/popups';
import usePopups from './hooks/usePopups';
import AddBasketBookPopup from './AddBasketBookPopup';

const popupsMap: Record<string, React.ComponentType<BasePopupProps>> = {
  [POPUPS.addBasketBook]: AddBasketBookPopup,
};

const Popups: React.FC = () => {
  const { mountedPopups, popups, } = usePopups();

  const popupsCount = mountedPopups.length;
  React.useEffect(() => {
    if (popupsCount) {
      document.body.classList.add('popup_open');
    }
    return () => {
      document.body.classList.remove('popup_open');
    };
  }, [popupsCount]);

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
