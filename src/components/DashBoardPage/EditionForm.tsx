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
import {
  Controller,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import { z } from 'zod';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { Textarea } from '../ui/textarea';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { DateTimePicker } from '../ui/datetime-picker';
import {
  AudiobookType,
  FullPrintedBookType,
  PrintedBookType,
} from 'pages/dashboard/editions';
import { Database } from 'api/books/types';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import slugify from 'slugify';

type PrintOptionsDataType =
  Database['public']['Tables']['PrintOptions']['Insert'];
type PrintSizeDataType = Database['public']['Tables']['PrintSize']['Insert'];
type PrintedBookInsertType =
  Database['public']['Tables']['PrintedBooks']['Insert'];
type coverDataType = Database['public']['Tables']['PrintedCover']['Insert'];
type AudioBookInsertType = Database['public']['Tables']['Audiobooks']['Insert'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const MAX_AUDIO_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MIN_PHOTOSET_LENGTH = 1;
const MAX_PHOTOSET_LENGTH = 10;

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/ogg',
  'audio/vnd.wav',
  'application/zip',
];

const photoSchema = z.object({
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

const photoSetSchema = z
  .array(photoSchema)
  .min(MIN_PHOTOSET_LENGTH, {
    message: `You need to add at least ${MIN_PHOTOSET_LENGTH} student`,
  })
  .max(MAX_PHOTOSET_LENGTH, {
    message: `You can add at most ${MAX_PHOTOSET_LENGTH} students`,
  });

const formSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his book counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  is_published: z.boolean({
    required_error: 'Publication status must be stated.',
  }),
  ISBN: z.string().min(3, {
    message: 'ISBN must be at least 3 characters long.',
  }),
  lit_form: z.string().min(3, {
    message: 'Literature dorm must be at least 3 characters long.',
  }),
  cover: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  pages: z.number().positive('must be positive'),
  discount: z.number().gte(0, 'discount must be 0 or greater'),
  sold: z.number().gte(0, 'sold copies number must be 0 or greater'),

  shade: z.literal('light').or(z.literal('dark')),

  price: z.number().positive('must be positive'),
  photos: photoSetSchema,
  publish_date: z
    .date({
      description: 'publist date',
    })
    .nullable()
    .optional(),
  release_date: z
    .date({
      description: 'release date',
    })
    .nullable()
    .optional(),
  bindings: z.string().min(3, {
    message: 'bindings info must be at least 3 characters long.',
  }),
  coverType: z.string().min(3, {
    message: 'cover info must be at least 3 characters long.',
  }),
  illustrations: z.string().min(3, {
    message: 'illustrations info must be at least 3 characters long.',
  }),
  paper: z.string().min(3, {
    message: 'paper info must be at least 3 characters long.',
  }),
  height: z.number().positive('must be positive'),
  width: z.number().positive('must be positive'),
});

const formEditSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his book counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  is_published: z.boolean({
    required_error: 'Publication status must be stated.',
  }),
  ISBN: z.string().min(3, {
    message: 'ISBN must be at least 3 characters long.',
  }),
  lit_form: z.string().min(3, {
    message: 'Literature dorm must be at least 3 characters long.',
  }),
  cover: z.any().optional(),
  pages: z.number().positive('must be positive'),
  discount: z.number().gte(0, 'discount must be 0 or greater'),
  sold: z.number().gte(0, 'sold copies number must be 0 or greater'),

  shade: z.literal('light').or(z.literal('dark')),
  price: z.number().positive('must be positive'),
  publish_date: z
    .date({
      description: 'publist date',
    })
    .nullable()
    .optional(),
  release_date: z
    .date({
      description: 'release date',
    })
    .nullable()
    .optional(),
  bindings: z.string().min(3, {
    message: 'bindings info must be at least 3 characters long.',
  }),
  coverType: z.string().min(3, {
    message: 'cover info must be at least 3 characters long.',
  }),
  illustrations: z.string().min(3, {
    message: 'illustrations info must be at least 3 characters long.',
  }),
  paper: z.string().min(3, {
    message: 'paper info must be at least 3 characters long.',
  }),
  height: z.number().positive('must be positive'),
  width: z.number().positive('must be positive'),
});

const audioFormSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his audiobook counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  is_published: z.boolean({
    required_error: 'Publication status must be stated.',
  }),
  discount: z.number().gte(0, 'discount must be 0 or greater'),
  sold: z.number().gte(0, 'sold copies number must be 0 or greater'),
  price: z.number().positive('must be positive'),
  publish_date: z
    .date({
      description: 'publist date',
    })
    .nullable()
    .optional(),
  release_date: z
    .date({
      description: 'release date',
    })
    .nullable()
    .optional(),
  duration: z.number().positive('must be positive'),
  audio: z
    .instanceof(File, { message: 'Audio file is required.' })
    .refine(
      (file) => file?.size <= MAX_AUDIO_FILE_SIZE,
      `Max file size is 20MB.`
    )
    .refine(
      (file) => ACCEPTED_AUDIO_TYPES.includes(file?.type),
      '.mp3, .wav, .ogg and .zip files are accepted.'
    ),
});

const audioFormEditSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his audiobook counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  is_published: z.boolean({
    required_error: 'Publication status must be stated.',
  }),
  discount: z.number().gte(0, 'discount must be 0 or greater'),
  sold: z.number().gte(0, 'sold copies number must be 0 or greater'),
  price: z.number().positive('must be positive'),
  publish_date: z
    .date({
      description: 'publist date',
    })
    .nullable()
    .optional(),
  release_date: z
    .date({
      description: 'release date',
    })
    .nullable()
    .optional(),
  duration: z.number().positive('must be positive'),
  audio: z.any().optional(),
});

async function setCoverData(coverUrl: string, printedBookID: number) {
  const { data, error } = await supabase
    .from('PrintedCover')
    .insert({
      PrintedBookID: printedBookID,
      source: coverUrl,
      shade: 'light',
      blurHash: 'NoHash',
    })
    .select('*')
    .single();

  console.log('cover data ... ', data);
  console.log('cover data ... ', JSON.stringify(data, null, 2));
  console.log('cover error ... ', error);

  const cover_ID = data ? data.id : null;

  console.log('printed Book ID ... ', cover_ID);

  return cover_ID;
}

async function updateCoverData(id: number, coverData: coverDataType) {
  const { data, error } = await supabase
    .from('PrintedCover')
    .update(coverData)
    .eq('id', id)
    .select('*')
    .single();

  console.log('cover data ... ', data);
  console.log('cover data ... ', JSON.stringify(data, null, 2));
  console.log('cover error ... ', error);

  const cover_ID = data ? data.id : null;

  console.log('printed Book ID ... ', cover_ID);

  return cover_ID;
}

const setPrintedData = async (printedData: PrintedBookInsertType) => {
  const newPrintedBook = await supabase
    .from('PrintedBooks')
    .insert(printedData)
    .select('*')
    .single();

  newPrintedBook.error && window.alert(newPrintedBook.error.message);
  newPrintedBook.data &&
    window.alert(
      `${newPrintedBook.data.id} успешно добавлен к печатным книгам`
    );

  if (newPrintedBook.data) {
    return newPrintedBook.data.id;
  } else {
    return null;
  }
};

const updatePrintedData = async (
  id: number,
  printedData: PrintedBookInsertType
) => {
  const printedBook = await supabase
    .from('PrintedBooks')
    .update(printedData)
    .eq('id', id)
    .select('*')
    .single();

  printedBook.error && window.alert(printedBook.error.message);
  printedBook.data &&
    window.alert(`${printedBook.data.id} успешно добавлен к печатным книгам`);

  if (printedBook.data) {
    return printedBook.data.id;
  } else {
    return null;
  }
};

async function setPrintOptionsData(printOptionsData: PrintOptionsDataType) {
  const { data, error } = await supabase
    .from('PrintOptions')
    .insert(printOptionsData)
    .select('*')
    .single();

  console.log('print options data ... ', data);
  console.log('print options data ... ', JSON.stringify(data, null, 2));
  console.log('print options error ... ', error);

  const printOptionsID = data ? data.id : null;

  console.log('print Options ID ... ', printOptionsID);

  return printOptionsID;
}

async function updatePrintOptionsData(
  optID: number,
  printOptionsData: PrintOptionsDataType
) {
  const { data, error } = await supabase
    .from('PrintOptions')
    .update(printOptionsData)
    .eq('id', optID)
    .select('*')
    .single();

  console.log('print options data ... ', data);
  console.log('print options data ... ', JSON.stringify(data, null, 2));
  console.log('print options error ... ', error);

  const printOptionsID = data ? data.id : null;

  console.log('print Options ID ... ', printOptionsID);

  return printOptionsID;
}

async function setPrintSizeData(printSizeData: PrintSizeDataType) {
  const { data, error } = await supabase
    .from('PrintSize')
    .insert(printSizeData)
    .select('*')
    .single();

  console.log('print size data ... ', data);
  console.log('print size data ... ', JSON.stringify(data, null, 2));
  console.log('print size error ... ', error);

  const printSizeID = data ? data.id : 'no ID for me';

  console.log('print Size ID ... ', printSizeID);

  return printSizeID;
}

async function updatePrintSizeData(
  id: number,
  printSizeData: PrintSizeDataType
) {
  const { data, error } = await supabase
    .from('PrintSize')
    .update(printSizeData)
    .eq('id', id)
    .select('*')
    .single();

  console.log('print size data ... ', data);
  console.log('print size data ... ', JSON.stringify(data, null, 2));
  console.log('print size error ... ', error);

  const printSizeID = data ? data.id : 'no ID for me';

  console.log('print Size ID ... ', printSizeID);

  return printSizeID;
}

const setAudioData = async (audioData: AudioBookInsertType) => {
  const newAudioBook = await supabase
    .from('Audiobooks')
    .insert(audioData)
    .select('*')
    .single();

  newAudioBook.error && window.alert(newAudioBook.error.message);
  newAudioBook.data &&
    window.alert(`${newAudioBook.data.id} успешно добавлен к аудио книгам`);

  if (newAudioBook.data) {
    return newAudioBook.data.id;
  } else {
    return null;
  }
};

const updateAudioData = async (id: number, audioData: AudioBookInsertType) => {
  const audioBook = await supabase
    .from('Audiobooks')
    .update(audioData)
    .eq('id', id)
    .select('*')
    .single();

  audioBook.error && window.alert(audioBook.error.message);
  audioBook.data &&
    window.alert(`аудио книга ${audioBook.data.id} успешно изменена`);

  if (audioBook.data) {
    return audioBook.data.id;
  } else {
    return null;
  }
};

async function getTitleName(id: number) {
  const { data } = await supabase
    .from('Titles')
    .select('*')
    .eq('id', id)
    .single();

  return data ? data.name : '';
}

function AudioBookForm({ titleID }: { titleID: number }) {
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof audioFormSchema>>({
    resolver: zodResolver(audioFormSchema),
    defaultValues: {
      counter_color: '#0800ffF',
      extra: 'some text',
      is_published: false,
      discount: 0,
      price: 100,
      publish_date: new Date(),
      release_date: new Date(),
      sold: 0,
      duration: 3600,
    },
  });

  async function onSubmit(values: z.infer<typeof audioFormSchema>) {
    console.log(values);

    const titleName = await getTitleName(titleID);
    console.log('title name is... ', titleName);

    const fileExtention = values.audio.name.split('.').pop();

    const audioUpload = await supabase.storage
      .from('audiobooks')
      .upload(`audio_${slugify(titleName)}.${fileExtention}`, values.audio, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('audiobooks')
      .getPublicUrl(`${audioUpload.data?.path}`).data.publicUrl;

    console.log('URL is... ', publicUrl);

    const audioData = {
      title_id: titleID,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      src: publicUrl,
      file_volume: values.audio.size,
      duration: values.duration,
    };

    const audiobookID = await setAudioData(audioData);
    console.log('new audiobook ID is ...', audiobookID);
    audiobookID && router.reload();
  }

  async function onAudioInputChange(event: ChangeEvent<HTMLInputElement>) {
    const audioInput = event.target;
    const aPlayer = audioPlayer.current;

    if (audioInput.files) {
      const file = audioInput.files[0];
      if (file) {
        aPlayer && (aPlayer.src = URL.createObjectURL(file));
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
            name='counter_color'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Counter Color</FormLabel>
                <FormControl>
                  <Input type='color' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='publish_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>publish date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('publish_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='release_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>release date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('release_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='audio'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>audio file</FormLabel>
                <FormControl>
                  <Input
                    id='cover'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onAudioInputChange(event);
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
                <audio
                  className={value ? 'max-w-72' : 'max-w-72 hidden'}
                  ref={audioPlayer}
                  controls
                  src=''
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='duration'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Duration, s</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='extra'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>extra info</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>discount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    max={100}
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sold'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Number of sold copies</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_published'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    className='bg-neutral-800'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>is published</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-64'
          >
            Добавить Аудиокнигу
          </Button>
        </form>
      </Form>
    </div>
  );
}

function AudioBookEditForm(audiobook: AudiobookType) {
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof audioFormEditSchema>>({
    resolver: zodResolver(audioFormEditSchema),
    defaultValues: {
      is_published:
        audiobook.is_published !== null ? audiobook.is_published : undefined,
      publish_date: audiobook.publish_date
        ? new Date(audiobook.publish_date)
        : undefined,
      release_date: audiobook.release_date
        ? new Date(audiobook.release_date)
        : undefined,
      counter_color: audiobook.counter_color || '#ff2a00',
      duration: audiobook.duration || 0,
      extra: audiobook.extra || '',
      discount: audiobook.discount !== null ? audiobook.discount : undefined,
      sold: audiobook.sold !== null ? audiobook.sold : undefined,
      price: audiobook.price !== null ? audiobook.price : undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof audioFormEditSchema>) {
    console.log('values ... ', values);

    let audioPath = null;
    let publicUrl = null;

    if (values.audio) {
      console.log('current book audio ... ', audiobook.src);

      const audioNameString = audiobook.src?.split('/') || 'no audio';

      console.log('audio Name String ... ', audioNameString);

      console.log('selected audio file ... ', values.audio);

      const audioRemove = await supabase.storage
        .from('audiobooks')
        .remove([audioNameString.slice(-1)[0]]);

      audioRemove.error &&
        console.log('audio Remove error ... ', audioRemove.error.message);

      audioRemove.data &&
        console.log('audio Remove data... ', audioRemove.data);

      const fileName = values.audio.name ? values.audio.name : 'failNameString';
      console.log('audio is...', values.audio);
      console.log('audio name is...', values.audio.name);

      const fileExtention = fileName.split('.').pop();

      const titleName = await getTitleName(audiobook.title_id);
      console.log('title name is... ', titleName);

      const audioUdate = await supabase.storage
        .from('audiobooks')
        .upload(`audio_${slugify(titleName)}.${fileExtention}`, values.audio, {
          cacheControl: '3600',
          upsert: true,
        });

      audioUdate.error &&
        console.log('audio update error ... ', audioUdate.error.message);

      audioPath = audioUdate.data?.path;
      console.log('audio path ... ', audioPath);
    }

    if (!values.audio) {
      audioPath = audiobook.src;
      publicUrl = audiobook.src;
    }

    !publicUrl &&
      audioPath &&
      (publicUrl = supabase.storage.from('audiobooks').getPublicUrl(audioPath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const audioData = {
      title_id: audiobook.title_id,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      src: publicUrl,
      file_volume: values.audio?.size || audiobook.file_volume,
      duration: values.duration,
    };

    const bookID = await updateAudioData(audiobook.id, audioData);

    router.reload();
  }

  async function onAudioInputChange(event: ChangeEvent<HTMLInputElement>) {
    const audioInput = event.target;
    const aPlayer = audioPlayer.current;

    if (audioInput.files) {
      const file = audioInput.files[0];
      if (file) {
        aPlayer && (aPlayer.src = URL.createObjectURL(file));
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
            name='counter_color'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Counter Color</FormLabel>
                <FormControl>
                  <Input type='color' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='publish_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='publish_date'>publish date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('publish_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='release_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='release_date'>release date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('release_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='audio'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>audio file</FormLabel>

                <p>{audiobook.src}</p>

                <a href={audiobook.src!} download target='_blank'>
                  download file
                </a>

                <FormControl>
                  <Input
                    id='cover'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onAudioInputChange(event);
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
                <audio
                  // className={value ? 'max-w-72' : 'max-w-72 hidden'}
                  ref={audioPlayer}
                  controls
                  src={audiobook.src!}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='duration'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Duration, s</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='extra'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>extra info</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>discount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    max={100}
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sold'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Number of sold copies</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_published'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    className='bg-neutral-800'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>is published</FormLabel>
                </div>
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

function PrintedBookForm({ titleID }: { titleID: number }) {
  const photoImage = useRef<HTMLImageElement | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      counter_color: '#FFFFF',
      extra: 'some text',
      is_published: false,
      ISBN: '1-234-54789-0',
      lit_form: 'Роман',
      pages: 123,
      discount: 0,
      shade: 'light',
      price: 100,
      publish_date: new Date(),
      release_date: new Date(),
      bindings: 'HardCore!',
      coverType: 'DisCover!',
      illustrations: 'Dazzling!',
      paper: 'Two Ply',
      height: 42,
      width: 42,
      sold: 0,
      photos: [
        {
          photo: undefined,
        },
      ],
    },
  });

  // Get properties from react hook form
  const {
    control,
    // handleSubmit,
    // formState: { errors },
  } = form;

  // Create dynamic forms
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'photos',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const photoUpload = await supabase.storage
      .from('covers')
      .upload(`public/cover_${values.cover.name}`, values.cover, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('covers')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    const printedData = {
      title_id: titleID,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      ISBN: values.ISBN,
      lit_form: values.lit_form,
      pages: values.pages,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
    };

    const bookID = await setPrintedData(printedData);
    console.log('new book ID is ...', bookID);

    const printOptionsData = {
      bindings: values.bindings,
      cover: values.coverType,
      paper: values.paper,
      illustrations: values.illustrations,
      PrintedBookID: bookID,
    };

    if (bookID) {
      const printOptionsID = await setPrintOptionsData(printOptionsData);
      console.log('new printed book options ID is ...', printOptionsID);
      const coverID = await setCoverData(publicUrl, bookID);
      console.log('new book COVER options ID is ...', coverID);

      if (printOptionsID) {
        const printSizeData = {
          width: values.width,
          height: values.height,
          PrintOptionsID: printOptionsID,
        };

        const printSizeOptionsID = await setPrintSizeData(printSizeData);
        console.log(
          'new printed book SIZE options ID is ...',
          printSizeOptionsID
        );
        router.reload();
      }
    }
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

  async function onPhotoInputChange(
    event: ChangeEvent<HTMLInputElement>,
    id: string
  ) {
    const photoInput = event.target;
    const pImage = document.getElementById(id) as HTMLImageElement;

    if (photoInput.files) {
      const file = photoInput.files[0];
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
            name='counter_color'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Counter Color</FormLabel>
                <FormControl>
                  <Input type='color' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='ISBN'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='publish_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>publish date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('publish_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='release_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>release date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('release_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lit_form'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Literature Form</FormLabel>
                <FormControl>
                  <Input placeholder='Повесть' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='pages'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Pages Number</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cover'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>book cover</FormLabel>
                <FormControl>
                  <Input
                    id='cover'
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

          <FormField
            control={form.control}
            name='shade'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>
                    shade = {field.value}
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'light'}
                    onCheckedChange={() => {
                      field.onChange();
                      field.value === 'light'
                        ? form.setValue('shade', 'dark')
                        : form.setValue('shade', 'light');
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>discount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    max={100}
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sold'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Number of sold copies</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_published'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    className='bg-neutral-800'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>is published</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='bindings'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Bindings</FormLabel>
                <FormControl>
                  <Input placeholder='HardCore!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='coverType'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Cover Type</FormLabel>
                <FormControl>
                  <Input placeholder='DisCover!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='illustrations'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Illustrations Type</FormLabel>
                <FormControl>
                  <Input placeholder='Dazzling!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='paper'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Paper Type</FormLabel>
                <FormControl>
                  <Input placeholder='Two Ply' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='height'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='width'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.map((item, index) => (
            <div className='block' key={`photosKey.${index}`}>
              <FormField
                control={form.control}
                name={`photos.${index}`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>book photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <Input
                        id={`photos.${index}`}
                        type='file'
                        {...fieldProps}
                        onChange={(event) => {
                          onPhotoInputChange(event, `photosImage.${index}`);
                          append({ photo: undefined });
                          return onChange(
                            event.target.files && event.target.files[0]
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <img
                      id={`photosImage.${index}`}
                      className='max-w-72'
                      src=''
                      alt='photo image'
                    />
                  </FormItem>
                )}
              />
              <Button
                color='failure'
                type='button'
                onClick={() => remove(index)}
              >
                Delete
              </Button>
            </div>
          ))}

          {/* <Button
            disabled={fields.length >= MAX_PHOTOSET_LENGTH}
            type='button'
            onClick={() => append({ photo: undefined })}
          >
            Append
          </Button> */}

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-64'
          >
            Добавить Печатную Книгу
          </Button>
        </form>
      </Form>
    </div>
  );
}

function PrintedBookEditForm(book: FullPrintedBookType) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  function setImage(path: string) {
    if (photoImage.current) {
      photoImage.current.src = path;
    }
  }

  async function getDataFromReq() {
    const { data } = await supabase
      .from('PrintedBooks')
      .select(
        ` *, 
                cover: PrintedCover(*), 
                options:PrintOptions ( *,
                  size:PrintSize( * )
              )`
      )
      .eq('id', book.id)
      .single();

    data && console.log('combined data from req is...', data);

    data &&
      (data.cover[0].source && setImage(data.cover[0].source),
      data.cover[0].shade && form.setValue('shade', data.cover[0].shade),
      data.options[0].bindings &&
        form.setValue('bindings', data.options[0].bindings),
      data.options[0].cover &&
        form.setValue('coverType', data.options[0].cover),
      data.options[0].illustrations &&
        form.setValue('illustrations', data.options[0].illustrations),
      data.options[0].paper && form.setValue('paper', data.options[0].paper),
      data.options[0].size[0].height &&
        form.setValue('height', data.options[0].size[0].height),
      data.options[0].size[0].width &&
        form.setValue('width', data.options[0].size[0].width),
      data.counter_color && form.setValue('counter_color', data.counter_color),
      data.ISBN && form.setValue('ISBN', data.ISBN),
      data.discount !== null && form.setValue('discount', data.discount),
      data.extra && form.setValue('extra', data.extra),
      data.is_published !== null &&
        form.setValue('is_published', data.is_published),
      data.lit_form && form.setValue('lit_form', data.lit_form),
      data.pages && form.setValue('pages', data.pages),
      data.price && form.setValue('price', data.price),
      data.sold && form.setValue('sold', data.sold));
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      publish_date: book.publish_date ? new Date(book.publish_date) : undefined,
      release_date: book.release_date ? new Date(book.release_date) : undefined,
      shade: 'light',
      counter_color: '#ff2a00',
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);

    let imagePath = null;
    let publicUrl = null;

    if (values.cover) {
      console.log('current book cover ... ', photoImage.current?.src);

      const imageNameString = photoImage.current?.src.split('/') || 'no image';

      console.log('image Name String ... ', imageNameString);

      console.log('selected cover file ... ', values.cover);

      const photoRemove = await supabase.storage
        .from('covers')
        .remove([`public/` + imageNameString.slice(-1)[0]]);

      photoRemove.error &&
        console.log('cover Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('cover Remove data... ', photoRemove.data);

      const fileName = values.cover?.name
        ? values.cover?.name
        : 'failNameString';
      console.log('photo is...', values.cover);
      console.log('photo name is...', values.cover?.name);

      const photoUdate = await supabase.storage
        .from('covers')
        .upload(`public/cover_${fileName}`, values.cover, {
          cacheControl: '3600',
          upsert: true,
        });

      photoUdate.error &&
        console.log('photo update error ... ', photoUdate.error.message);

      imagePath = photoUdate.data?.path;
      console.log('image path ... ', imagePath);
    }

    if (!values.cover) {
      imagePath = photoImage.current?.src;
      publicUrl = photoImage.current?.src;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('covers').getPublicUrl(imagePath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const printedData = {
      title_id: book.title_id,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      ISBN: values.ISBN,
      lit_form: values.lit_form,
      pages: values.pages,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
    };

    const bookID = await updatePrintedData(book.id, printedData);
    console.log('new book ID is ...', bookID);

    const printOptionsData = {
      bindings: values.bindings,
      cover: values.coverType,
      paper: values.paper,
      illustrations: values.illustrations,
      PrintedBookID: bookID,
    };

    const optionsID = book.options[0].id;

    const coverOptionsData = {
      PrintedBookID: bookID,
      source: publicUrl!,
      shade: values.shade,
      blurHash: 'NoHash',
    };

    const coverPropsID = book.cover[0].id;

    if (bookID) {
      const printOptionsID = await updatePrintOptionsData(
        optionsID,
        printOptionsData
      );
      console.log('new printed book options ID is ...', printOptionsID);
      const coverID = await updateCoverData(coverPropsID, coverOptionsData);
      console.log('new book COVER options ID is ...', coverID);

      if (printOptionsID) {
        const printSizeData = {
          width: values.width,
          height: values.height,
          PrintOptionsID: printOptionsID,
        };

        const printSizeOptionsPropsID = book.options[0].size[0].id;

        const printSizeOptionsID = await updatePrintSizeData(
          printSizeOptionsPropsID,
          printSizeData
        );
        console.log(
          'new printed book SIZE options ID is ...',
          printSizeOptionsID
        );
        router.reload();
      }
    }
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
            name='counter_color'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Counter Color</FormLabel>
                <FormControl>
                  <Input type='color' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='ISBN'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Textarea
                    // placeholder='Tell us a little bit about yourself'
                    // className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='publish_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='publish_date'>publish date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('publish_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='release_date'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='release_date'>release date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('release_date', null);

                      console.log('on null function call');
                      console.log('form state is...', form.getValues());
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lit_form'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Literature Form</FormLabel>
                <FormControl>
                  <Input placeholder='Повесть' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='pages'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Pages Number</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cover'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>book cover</FormLabel>
                <FormControl>
                  <Input
                    id='cover'
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

          <FormField
            control={form.control}
            name='shade'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>
                    shade = {field.value}
                  </FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === 'light'}
                    onCheckedChange={() => {
                      field.onChange();
                      field.value === 'light'
                        ? form.setValue('shade', 'dark')
                        : form.setValue('shade', 'light');
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='discount'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>discount</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    max={100}
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='sold'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Number of sold copies</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_published'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    className='bg-neutral-800'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>is published</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='bindings'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Bindings</FormLabel>
                <FormControl>
                  <Input placeholder='HardCore!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='coverType'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Cover Type</FormLabel>
                <FormControl>
                  <Input placeholder='DisCover!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='illustrations'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Illustrations Type</FormLabel>
                <FormControl>
                  <Input placeholder='Dazzling!' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='paper'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Paper Type</FormLabel>
                <FormControl>
                  <Input placeholder='Two Ply' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='height'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='width'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    {...field}
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
                <FormMessage />
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

export {
  PrintedBookForm,
  PrintedBookEditForm,
  AudioBookForm,
  AudioBookEditForm,
};
