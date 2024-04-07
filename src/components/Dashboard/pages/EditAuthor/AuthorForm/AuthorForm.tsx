import { Form, FormField } from '@/components/ui/form';
import { AuthorModel } from '@/store/models/author';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { FormInput, FormTextarea, FormDatetime } from '../../components/form';
import { supabase } from 'api/supabase-client';
import {
  AuthorFormFields,
  authorFormSchema,
} from '@/entities/author/validation';
import { useAuthorStore } from '@/store/locals';

type Props = {
  author: AuthorModel;
};

const AuthorForm: React.FC<Props> = ({ author }) => {
  const authorStore = useAuthorStore();
  const form = useForm<AuthorFormFields>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: {
      ...author.formData,
      photo: undefined,
    },
  });

  async function onEditSubmit(values: AuthorFormFields) {
    let imagePath = null;
    let publicUrl = null;

    if (author.photo && values.photo) {
      const imageNameString = author.photo.split('/');

      const photoRemove = await supabase.storage
        .from('authors')
        .remove([imageNameString.slice(-1)[0]]);

      const fileName = values.photo?.name
        ? values.photo?.name
        : 'failNameString';

      const photoUdate = await supabase.storage
        .from('authors')
        .upload(`author_${fileName}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });

      imagePath = photoUdate.data?.path;
    }

    if (!author.photo && values.photo) {
      const photoUpload = await supabase.storage
        .from('authors')
        .upload(`author_${values.photo.name}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });
      imagePath = photoUpload.data?.path;
    }

    if (author.photo && !values.photo) {
      imagePath = author.photo;
      publicUrl = author.photo;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('authors').getPublicUrl(imagePath)
        .data.publicUrl);

    const { data, error } = await supabase
      .from('Authors')
      .update({
        birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
        death_date: values.deathDate ? values.deathDate.toUTCString() : null,
        phrase: values.phrase,
        photo: publicUrl,
        city: values.city,
        bio: values.bio,
      })
      .eq('id', author.id)
      .select('*')
      .single();
  }

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
