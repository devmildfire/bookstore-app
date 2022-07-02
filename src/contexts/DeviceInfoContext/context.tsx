import React from 'react';
import { DeviceInfo } from '@/types/deviceInfo';

export default React.createContext<DeviceInfo>({
  device: 'desktop',
  isDesktop: true,
  isDesktopSmall: false,
  isMobile: false,
  isTabletHorizontal: false,
  isTabletVertical: false,
});
