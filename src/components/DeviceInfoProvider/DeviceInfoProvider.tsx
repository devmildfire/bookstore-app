import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import DeviceInfoContext from '@/contexts/DeviceInfoContext';
import calculateDeviceInfo from '@/utils/calculateDeviceInfo';

const DeviceInfoProvider = (
  props: PropsWithChildren<{}>,
): React.ReactElement => {
  const [deviceInfo, setDeviceInfo] = useState(calculateDeviceInfo(0));
  const { children } = props;

  const onResize = useCallback(() => {
    const newDeviceInfo = calculateDeviceInfo(window.innerWidth);

    if (deviceInfo.device !== newDeviceInfo.device) {
      setDeviceInfo(newDeviceInfo);
    }
  }, [deviceInfo]);

  useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);

  useEffect(() => {
    onResize();
  }, []);

  return (
    <DeviceInfoContext.Provider value={deviceInfo}>
      {children}
    </DeviceInfoContext.Provider>
  );
};

export default DeviceInfoProvider;
