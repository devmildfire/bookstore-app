import { useCallback, useState } from 'react';
import { VoidFunction } from '@/types/common';

type UseToggleResponse = [boolean, VoidFunction];

const useToggle = (defaultValue = false): UseToggleResponse => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggle = useCallback(() => {
    setValue((state) => !state);
  }, []);

  return [value, toggle];
};

export default useToggle;
