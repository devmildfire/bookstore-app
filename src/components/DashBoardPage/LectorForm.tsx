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
import { Textarea } from '../ui/textarea';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AuthorsType } from 'pages/dashboard/authors';
import { DateTimePicker } from '../ui/datetime-picker';
import DeleteDialog from './DeleteDialog';
import slugify from 'slugify';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export type LectorsType = {
  id: number;
  name: string;
  bio: string;
  photo: string;
};

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Author name must be at least 3 characters long.',
  }),
  bio: z.string().min(6, {
    message: 'Author bio must be at least 3 characters long.',
  }),
  photo: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

const formEditSchema = z.object({
  name: z.string().min(3, {
    message: 'Author name must be at least 3 characters long.',
  }),
  bio: z.string().min(6, {
    message: 'Author bio must be at least 3 characters long.',
  }),
  photo: z
    .instanceof(File, { message: 'Image is required.' })
    .optional()
    .refine(
      (file) => !file || file?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

function LectorForm() {
  const router = useRouter();
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'some name',
      bio: 'some bio',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const time = Date.now();

    const fileExt = values.photo.name.split('.').pop();

    const photoUpload = await supabase.storage
      .from('lectors')
      .upload(
        `lector_${slugify(values.name)}_${time}.${fileExt}`,
        values.photo,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

    const publicUrl = supabase.storage
      .from('lectors')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('Lectors')
      .insert({
        name: values.name,
        photo: publicUrl,
        bio: values.bio,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к лекторам`);
    router.reload();
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
            name='name'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Name</FormLabel>
                <FormControl>
                  <Input placeholder='somebody' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Aithor Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='photo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Photo</FormLabel>
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

function LectorEditForm(lector: LectorsType) {
  const [newPhoto, setNewPhoto] = useState<string>();

  const photoImage = useRef<HTMLImageElement | null>(null);

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Lectors')
      .select('*')
      .eq('id', lector.id)
      .single();

    data && console.log('data from req is...', data);

    data &&
      (data.photo && setNewPhoto(data.photo),
      data.bio && form.setValue('bio', data.bio),
      data.name && form.setValue('name', data.name));
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      bio: lector.bio || undefined,
      name: lector.name || undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    let imagePath = null;
    let publicUrl = null;

    if (lector.photo && values.photo) {
      console.log('current lector photo ... ', lector.photo);

      const imageNameString = lector.photo.split('/').pop() || 'no image';

      console.log('image Name String ... ', imageNameString);

      console.log('selected photo file ... ', values.photo);

      const photoRemove = await supabase.storage
        .from('lectors')
        .remove([imageNameString]);

      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);

      const fileExt = values.photo.name.split('.').pop();

      const photoUdate = await supabase.storage
        .from('lectors')
        .upload(
          `lector_${slugify(values.name)}_${time}.${fileExt}`,
          values.photo,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      photoUdate.error &&
        console.log('photo update error ... ', photoUdate.error.message);

      imagePath = photoUdate.data?.path;
      console.log('image path ... ', imagePath);
    }

    if (!lector.photo && values.photo) {
      const fileExt = values.photo.name.split('.').pop();

      const photoUpload = await supabase.storage
        .from('lectors')
        .upload(
          `lector_${slugify(values.name)}_${time}.${fileExt}`,
          values.photo,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );
      imagePath = photoUpload.data?.path;
    }

    if (lector.photo && !values.photo) {
      imagePath = lector.photo;
      publicUrl = lector.photo;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('lectors').getPublicUrl(imagePath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const { data, error } = await supabase
      .from('Lectors')
      .update({
        photo: publicUrl,
        name: values.name,
        bio: values.bio,
      })
      .eq('id', lector.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`лектор ${data.name} успешно обновлён`);
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
            name='name'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Lector name</FormLabel>
                <FormControl>
                  <Input
                    aria-label={'lector name'}
                    placeholder='some name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='bio'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Lector Bio</FormLabel>
                <FormControl>
                  <Textarea
                    aria-label={'author bio'}
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='photo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Lector Photo</FormLabel>
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
                  src={newPhoto || lector.photo || ''}
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog deleteFunction={deleteLector} itemID={lector.id} />
          </div>
        </form>
      </Form>
    </div>
  );
}

const getLectorByID = async (lectorID: number) => {
  const lector = await supabase
    .from('Lectors')
    .select('*')
    .eq('id', lectorID)
    .single();

  return lector.data || null;
};

const deleteLector = async (lectorID: number) => {
  let success = false;
  const lector = await getLectorByID(lectorID);

  const fileNameString = (lector && lector.photo.split('/').pop()) || 'no file';
  const photoRemove = await supabase.storage
    .from('lectors')
    .remove([fileNameString]);

  if (lector) {
    const { error } = await supabase
      .from('Lectors')
      .delete()
      .eq('id', lector.id);

    error && window.alert(error.message);
    !error &&
      !photoRemove.error &&
      (success = true) &&
      window.alert(`Лектор ${lector.name} успешно удалён`);
  }

  return success;
};

export { LectorForm, LectorEditForm };
