import * as React from 'react';
import { createPortal } from 'react-dom';

const Portal: React.FC = (props) => {
  const { children, } = props;
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);

  React.useLayoutEffect(() => {
    const wrapper = document.createElement('div');
    document.body.append(wrapper);
    setContainer(wrapper);

    return () => {
      document.body.removeChild(wrapper);
    };
  }, []);

  return container ? createPortal(children, container) : null;
};

export default Portal;
