import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AwardsType } from 'pages/dashboard/awards';
import slugify from 'slugify';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Award name must be at least 3 characters long.',
  }),
  picture: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp and .svg files are accepted.'
    ),
});

const formEditSchema = z.object({
  picture: z.any().optional(),
  title: z.string().min(3, {
    message: 'Award must be least 3 characters.',
  }),
});

type AwardFormProps = {
  defaultTitle: string;
};

function AwardForm(props: AwardFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: props.defaultTitle,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const photoUpload = await supabase.storage
      .from('awards')
      .upload(`award_${values.title}`, values.picture, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('awards')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('Awards')
      .insert({
        title: values.title,
        source: publicUrl,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.title} успешно добавлена к наградам`);
  }

  async function onImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const imageInput = event.target;
    const pImage = photoImage.current;

    if (imageInput.files) {
      const file = imageInput.files[0];
      if (file) {
        pImage && (pImage.src = URL.createObjectURL(file));
      }
    }
  }

  return (
    <div className=''>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Award Name</FormLabel>
                <FormControl>
                  <Input placeholder='some award' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='picture'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Award picture</FormLabel>
                <FormControl>
                  <Input
                    id='photo'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onImageInputChange(event);
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
                <img
                  className='max-w-72'
                  ref={photoImage}
                  src=''
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-48'
          >
            Добавить
          </Button>
        </form>
      </Form>
    </div>
  );
}

function AwardEditForm(award: AwardsType) {
  const [newPhoto, setNewPhoto] = useState<string>();

  const photoImage = useRef<HTMLImageElement | null>(null);

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Awards')
      .select('*')
      .eq('id', award.id)
      .single();

    data && console.log('data from req is...', data);

    data &&
      (data.source && setNewPhoto(data.source),
      data.title && form.setValue('title', data.title));
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      title: award.title ? award.title : undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);

    let imagePath = null;
    let publicUrl = null;

    if (award.source && values.picture) {
      console.log('current award picture ... ', award.source);

      const imageNameString = award.source.split('/');

      console.log('image Name String ... ', imageNameString);

      console.log('selected photo file ... ', values.picture);

      const photoRemove = await supabase.storage
        .from('awards')
        .remove([imageNameString.slice(-1)[0]]);

      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);

      const fileName = values.title ? slugify(values.title) : 'failNameString';
      console.log('photo is...', values.picture);
      console.log('photo name is...', values.picture?.name);

      const photoUdate = await supabase.storage
        .from('awards')
        .upload(`award_${fileName}`, values.picture, {
          cacheControl: '3600',
          upsert: true,
        });

      photoUdate.error &&
        console.log('photo update error ... ', photoUdate.error.message);

      imagePath = photoUdate.data?.path;
      console.log('image path ... ', imagePath);
    }

    if (award.source && !values.picture) {
      imagePath = award.source;
      publicUrl = award.source;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('awards').getPublicUrl(imagePath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const { data, error } = await supabase
      .from('Awards')
      .update({
        source: publicUrl,
      })
      .eq('id', award.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`награда ${data.title} успешно обновлена`);
    data && router.reload();
  }

  async function onImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const imageInput = event.target;
    const pImage = photoImage.current;

    if (imageInput.files) {
      const file = imageInput.files[0];
      if (file) {
        pImage && (pImage.src = URL.createObjectURL(file));
      }
    }
  }

  return (
    <div className=''>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onEditSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='picture'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Award Picture</FormLabel>
                <FormControl>
                  <Input
                    aria-label={'author photo'}
                    id='photo'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onImageInputChange(event);
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
                <img
                  className='max-w-72'
                  ref={photoImage}
                  src={newPhoto || award.source || ''}
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-48'
          >
            Обновить
          </Button>
        </form>
      </Form>
    </div>
  );
}

export { AwardForm, AwardEditForm };
