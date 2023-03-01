import { useState, useEffect } from 'react';

const useScreenSize = (): number[] => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const setSize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [width, height]);

  return [width, height];
};

export default useScreenSize;
