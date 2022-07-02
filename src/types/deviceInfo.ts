export type Device =
  | 'desktop'
  | 'desktop-small'
  | 'tablet-horizontal'
  | 'tablet-vertical'
  | 'mobile';

export interface DeviceInfo {
  device: Device;
  isDesktop: boolean;
  isDesktopSmall: boolean;
  isTabletHorizontal: boolean;
  isTabletVertical: boolean;
  isMobile: boolean;
}
