import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input, InputProps } from '@/components/ui/input';
import * as React from 'react';

interface Props extends InputProps {
  label: string;
  children: React.ReactNode;
}

const FormInput: React.FC<Props> = ({ label, children }) => {
  return (
    <FormItem className='grid gap-2'>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
    </FormItem>
  );
};

export default React.memo(FormInput);
