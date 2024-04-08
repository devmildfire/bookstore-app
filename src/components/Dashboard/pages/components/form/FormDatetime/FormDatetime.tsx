import {
  DatePickerProps,
  DateTimePicker,
} from '@/components/ui/datetime-picker';

import * as React from 'react';
import { BaseFormItem } from '../BaseFormItem';

interface Props extends DatePickerProps {
  label: string;
}

const FormDatetime: React.FC<Props> = ({ label, ...datetimeProps }) => {
  return (
    <BaseFormItem label={label}>
      <DateTimePicker
        jsDate={datetimeProps.jsDate}
        onJsDateChange={datetimeProps.onJsDateChange}
      />
    </BaseFormItem>
  );
};

export default FormDatetime;
