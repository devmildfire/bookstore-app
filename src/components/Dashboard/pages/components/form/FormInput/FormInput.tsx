import { Input, InputProps } from '@/components/ui/input';
import * as React from 'react';

import { BaseFormItem } from '../BaseFormItem';

interface Props extends InputProps {
  label: string;
}

const FormInput: React.FC<Props> = ({ label, ...props }) => {
  return (
    <BaseFormItem label={label}>
      <Input {...props} />
    </BaseFormItem>
  );
};

export default React.memo(FormInput);
