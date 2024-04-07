import * as React from 'react';
import { BaseFormItem } from '../BaseFormItem';
import { Textarea, TextareaProps } from '@/components/ui/textarea';

interface Props extends TextareaProps {
  label: string;
}

const FormTextarea: React.FC<Props> = ({ label, ...props }) => {
  return (
    <BaseFormItem label={label}>
      <Textarea {...props} />
    </BaseFormItem>
  );
};

export default React.memo(FormTextarea);
