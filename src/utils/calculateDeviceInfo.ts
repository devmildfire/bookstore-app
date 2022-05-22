import { DeviceInfo } from '../types/deviceInfo';

export default (width: string | number): DeviceInfo => {
  const deviceInfo: DeviceInfo = {
    device: 'mobile',
    isDesktop: false,
    isDesktopSmall: false,
    isMobile: false,
    isTabletHorizontal: false,
    isTabletVertical: false,
  };
  if (width <= 576) {
    deviceInfo.device = 'mobile';
    deviceInfo.isMobile = true;
  } else if (width <= 830) {
    deviceInfo.device = 'tablet-vertical';
    deviceInfo.isTabletVertical = true;
  } else if (width <= 1024) {
    deviceInfo.device = 'tablet-horizontal';
    deviceInfo.isTabletHorizontal = true;
  } else if (width <= 1440) {
    deviceInfo.device = 'desktop-small';
    deviceInfo.isDesktopSmall = true;
  } else {
    deviceInfo.device = 'desktop';
    deviceInfo.isDesktop = true;
  }

  return deviceInfo;
};
