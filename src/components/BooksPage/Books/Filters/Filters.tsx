import * as React from 'react';
import Author from './Author';
import Type from './Type';
import Year from './Year';

const Filters: React.FC = () => {
  /* TODO: структурировать и стилизовать фильтры */
  return (
    <div>
      <Year />
      <Type />
      <Author />
    </div>
  );
};

export default React.memo(Filters);
