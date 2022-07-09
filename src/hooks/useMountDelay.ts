import * as React from 'react';

interface UseTransitionOptions {
  readonly open: boolean;
  readonly enterTimeout?: number;
  readonly exitTimeout?: number;
  readonly defaultValue?: boolean;
}

const useMountDelay = (options: UseTransitionOptions): boolean => {
  const {
    open,
    enterTimeout = 0,
    exitTimeout = 0,
    defaultValue = false,
  } = options;
  const [isMount, setIsMount] = React.useState<boolean>(defaultValue);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => setIsMount(true), enterTimeout);

      return () => {
        setTimeout(() => setIsMount(false), exitTimeout);
      };
    }

    return () => {};
  }, [enterTimeout, exitTimeout, open]);

  return isMount;
};

export default useMountDelay;
