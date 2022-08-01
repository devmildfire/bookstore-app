import * as React from 'react';
import Select, { OptionType, SelectValue } from '@/components/Common/Select';

const options: OptionType<SelectValue>[] = [
  {
    label: '2017',
    value: '2017',
  },
  {
    label: '2018',
    value: '2018',
  },
  {
    label: '2019',
    value: '2019',
  },
  {
    label: '2020',
    value: '2020',
  },
  {
    label: '2021',
    value: '2021',
  },
];

const Filters: React.FC = () => {
  const [value, setValue] = React.useState(options[0]);
  return (
    <div>
      <Select
        onChange={setValue}
        options={options}
        title='Год издания'
        value={value}
      />
    </div>
  );
};

export default React.memo(Filters);
