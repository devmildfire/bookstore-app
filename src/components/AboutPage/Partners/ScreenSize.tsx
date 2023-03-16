import { useState, useEffect } from 'react';

const WindowWiderThan = (size: number): boolean => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setWidth]);

  return width > size;
};

export default WindowWiderThan;
