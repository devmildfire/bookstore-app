import { useState, useEffect } from 'react';

const useScreenSize = (): number[] => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  const setSize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    setScreenWidth(screen.width);
    setScreenHeight(screen.height);
  };

  useEffect(() => {
    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [width, height]);

  return [width, height, screenWidth, screenHeight];
};

export default useScreenSize;
