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
// import { Worker } from 'pages/dashboard/authors';
import { Worker } from 'pages/dashboard/titles';
// import { DateTimePicker } from '../ui/datetime-picker';
import DeleteDialog from './DeleteDialog';
import slugify from 'slugify';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Worker name must be at least 1 characters long.',
  }),
  surname: z.string().min(1, {
    message: 'Worker surname must be at least 1 characters long.',
  }),
  job: z.string().min(1, {
    message: 'Workers job must be at least 1 characters long.',
  }),
  photo: z
    .instanceof(File, { message: 'Image is optional.' })
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

const formEditSchema = z.object({
  name: z.string().min(1, {
    message: 'Worker name must be at least 1 characters long.',
  }),
  surname: z.string().min(1, {
    message: 'Worker surname must be at least 1 characters long.',
  }),
  job: z.string().min(1, {
    message: 'Workers job must be at least 1 characters long.',
  }),
  photo: z
    .instanceof(File, { message: 'Image is optional.' })
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

function WorkerForm() {
  const router = useRouter();
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'some name',
      job: 'some job',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const time = Date.now();

    let publicUrl = null;

    
    if (values.photo) {
      
      const fileExt = values.photo?.name.split('.').pop();

      const photoUpload = await supabase.storage
      .from('workers')
      .upload(
        `worker_${slugify(values.name)}_${time}.${fileExt}`,
        values.photo,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

      publicUrl = supabase.storage
        .from('workers')
        .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;
    }


    const { data, error } = await supabase
      .from('Workers')
      .insert({
        name: values.name,
        surname: values.surname,
        photo: publicUrl,
        job: values.job,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} ${data.surname} успешно добавлен к работникам`);
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
                <FormLabel>Worker Name</FormLabel>
                <FormControl>
                  <Input placeholder='somebody' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='surname'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Worker Surname</FormLabel>
                <FormControl>
                  <Input placeholder='somesurname' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='job'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Worker Job</FormLabel>
                <FormControl>
                  <Input placeholder='somejob' {...field} />
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
                <FormLabel>Worker Photo</FormLabel>
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

function WorkerEditForm(worker: Worker) {
  const [newPhoto, setNewPhoto] = useState<string>();

  const photoImage = useRef<HTMLImageElement | null>(null);

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Workers')
      .select('*')
      .eq('id', worker.id)
      .single();

    data && console.log('data from req is...', data);

    data &&
      (
        data.photo && setNewPhoto(data.photo),
        data.job && form.setValue('job', data.job),
        data.name && form.setValue('name', data.name),
        data.surname && form.setValue('surname', data.surname)
      );
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      job: worker.job || undefined,
      name: worker.name || undefined,
      surname: worker.surname || undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    let imagePath = null;
    let publicUrl = null;

    if (worker.photo && values.photo) {
      console.log('current worker photo ... ', worker.photo);

      const imageNameString = worker.photo.split('/').pop() || 'no image';

      console.log('image Name String ... ', imageNameString);

      console.log('selected photo file ... ', values.photo);

      const photoRemove = await supabase.storage
        .from('workers')
        .remove([imageNameString]);

      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);

      const fileExt = values.photo.name.split('.').pop();

      const photoUdate = await supabase.storage
        .from('workers')
        .upload(
          `worker_${slugify(values.name)}_${time}.${fileExt}`,
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

    if (!worker.photo && values.photo) {
      const fileExt = values.photo.name.split('.').pop();

      const photoUpload = await supabase.storage
        .from('workers')
        .upload(
          `worker_${slugify(values.name)}_${time}.${fileExt}`,
          values.photo,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );
      imagePath = photoUpload.data?.path;
    }

    if (worker.photo && !values.photo) {
      imagePath = worker.photo;
      publicUrl = worker.photo;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('workers').getPublicUrl(imagePath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const { data, error } = await supabase
      .from('Workers')
      .update({
        photo: publicUrl || undefined,
        name: values.name,
        surname: values.surname,
        job: values.job,
      })
      .eq('id', worker.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`работник ${data.name} ${data.surname} успешно обновлён`);
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
                <FormLabel>Worker name</FormLabel>
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
            name='surname'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Worker surname</FormLabel>
                <FormControl>
                  <Input
                    aria-label={'lector name'}
                    placeholder='some surname'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='job'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Workers job</FormLabel>
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
            name='photo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Workers Photo</FormLabel>
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
                  src={newPhoto || worker.photo || ''}
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

            <DeleteDialog deleteFunction={deleteWorker} itemID={worker.id} />
          </div>
        </form>
      </Form>
    </div>
  );
}

const getWorkerByID = async (workerID: number) => {
  const worker = await supabase
    .from('Workers')
    .select('*')
    .eq('id', workerID)
    .single();

  return worker.data || null;
};

const deleteWorker = async (workerID: number) => {
  let success = false;
  const worker = await getWorkerByID(workerID);

  const fileNameString = (worker && worker.photo?.split('/').pop()) || 'no file';
  const photoRemove = await supabase.storage
    .from('workers')
    .remove([fileNameString]);

  if (worker) {
    const { error } = await supabase
      .from('Workers')
      .delete()
      .eq('id', worker.id);

    error && window.alert(error.message);
    !error &&
      !photoRemove.error &&
      (success = true) &&
      window.alert(`Работник ${worker.name} ${worker.surname} успешно удалён`);
  }

  return success;
};

export { WorkerForm, WorkerEditForm };
