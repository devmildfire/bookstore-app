import * as React from 'react';
import calculateDeviceInfo from '@/utils/calculateDeviceInfo';
import DeviceInfoContext from './context';

const DeviceInfoProvider: React.FC<
  React.PropsWithChildren<Record<string, never>>
> = (props) => {
  const [deviceInfo, setDeviceInfo] = React.useState(calculateDeviceInfo(0));
  const { children } = props;

  const onResize = React.useCallback(() => {
    const newDeviceInfo = calculateDeviceInfo(window.innerWidth);

    if (deviceInfo.device !== newDeviceInfo.device) {
      setDeviceInfo(newDeviceInfo);
    }
  }, [deviceInfo]);

  React.useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);

  React.useEffect(() => {
    onResize();
  }, []);

  return (
    <DeviceInfoContext.Provider value={deviceInfo}>
      {children}
    </DeviceInfoContext.Provider>
  );
};

export default DeviceInfoProvider;
