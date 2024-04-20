import { Form, FormField } from '@/components/ui/form';
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';

import { FormInput, FormTextarea, FormDatetime } from '../../components/form';
import { AuthorFormFields } from '@/entities/author/validation';

type Props = {
  form: UseFormReturn<AuthorFormFields>;
};

const AuthorForm: React.FC<Props> = ({ form }) => {
  return (
    <Form {...form}>
      <form className='grid gap-6'>
        <FormField
          name='name'
          control={form.control}
          render={({ field }) => (
            <FormInput label='Имя' placeholder='Имя' {...field} />
          )}
        />
        <FormField
          name='city'
          control={form.control}
          render={({ field }) => (
            <FormInput label='Город' placeholder='Город' {...field} />
          )}
        />
        <div className='flex gap-3 items-stretch'>
          <FormField
            name='birthDate'
            control={form.control}
            render={({ field }) => (
              <FormDatetime
                label='Дата рождения'
                jsDate={field.value}
                onJsDateChange={field.onChange}
              />
            )}
          />
          <FormField
            name='deathDate'
            control={form.control}
            render={({ field }) => (
              <FormDatetime
                label='Дата смерти'
                jsDate={field.value}
                onJsDateChange={field.onChange}
              />
            )}
          />
        </div>
        <FormField
          name='phrase'
          control={form.control}
          render={({ field }) => <FormInput label='Город' {...field} />}
        />
        <FormField
          name='bio'
          control={form.control}
          render={({ field }) => <FormTextarea label='Биография' {...field} />}
        />
      </form>
    </Form>
  );
};

export default React.memo(AuthorForm);
