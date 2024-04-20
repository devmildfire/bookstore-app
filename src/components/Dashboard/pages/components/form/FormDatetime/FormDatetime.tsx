import { DateTimePicker } from '@/components/ui/datetime-picker';

import * as React from 'react';
import { BaseFormItem } from '../BaseFormItem';

// interface Props extends DatePickerProps {
//   label: string;
// }

interface Props {
  label: string;
  jsDate: Date | null | undefined;
  onJsDateChange: () => void;
}

const FormDatetime: React.FC<Props> = ({ label, jsDate, onJsDateChange }) => {
  return (
    <BaseFormItem label={label}>
      <DateTimePicker jsDate={jsDate} onJsDateChange={onJsDateChange} />
    </BaseFormItem>
  );
};

export default FormDatetime;
