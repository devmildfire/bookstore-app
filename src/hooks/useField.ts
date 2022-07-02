import { ChangeEvent, useCallback, useState } from 'react';

export default <T extends string | number>(defaultValue?: T) => {
  const [value, setValue] = useState(defaultValue || '');

  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    setValue(evt.target.value);
  }, []);

  const reset = useCallback(() => setValue(defaultValue || ''), [defaultValue]);

  return {
    value,
    onChange,
    reset,
  };
};
