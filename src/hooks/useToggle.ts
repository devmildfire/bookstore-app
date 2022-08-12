import { useCallback, useState } from 'react';
import { VoidFunction } from '@/types/common';

export interface UseToggleResult {
  readonly value: boolean;
  readonly toggleOn: VoidFunction;
  readonly toggleOff: VoidFunction;
}

const useToggle = (defaultValue = false): UseToggleResult => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggleOn = useCallback(() => {
    setValue(true);
  }, []);

  const toggleOff = useCallback(() => {
    console.log('off');
    setValue(false);
  }, []);

  return { value, toggleOff, toggleOn };
};

export default useToggle;
