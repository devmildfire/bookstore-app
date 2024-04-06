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
import { FullPrintedBookType, PrintedBookType } from 'pages/dashboard/editions';
import { Database } from 'api/books/types';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';

// type coverShadeType = Database['public']['Enums']['covershade'];
type coverShadeType = Database['public']['Enums']['covershade'];
type PrintOptionsDataType =
  Database['public']['Tables']['PrintOptions']['Insert'];
type PrintSizeDataType = Database['public']['Tables']['PrintSize']['Insert'];
type PrintedBookInsertType =
  Database['public']['Tables']['PrintedBooks']['Insert'];
type coverDataType = Database['public']['Tables']['PrintedCover']['Insert'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

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

// const formEditSchema = { ...formSchema, cover: z.any().optional() };

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
    },
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
          {/* <FormField
            control={form.control}
            name='shade'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select cover shade ' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='light'>light</SelectItem>
                    <SelectItem value='dark'>dark</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

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
  const [newPhoto, setNewPhoto] = useState<string>();

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
      // bio: author.bio ? author.bio : undefined,
      publish_date: book.publish_date ? new Date(book.publish_date) : undefined,
      release_date: book.release_date ? new Date(book.release_date) : undefined,
      shade: 'light',
      counter_color: '#ff2a00',
      // deathDate: author.death_date ? new Date(author.death_date) : undefined,
      // city: author.city ? author.city : undefined,
      // photo: undefined,
      // phrase: author.phrase ? author.phrase : undefined,
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

    // if (!author.photo && values.photo) {
    //   const photoUpload = await supabase.storage
    //     .from('authors')
    //     .upload(`author_${values.photo.name}`, values.photo, {
    //       cacheControl: '3600',
    //       upsert: true,
    //     });
    //   imagePath = photoUpload.data?.path;
    // }

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
          {/* <FormField
            control={form.control}
            name='shade'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select cover shade ' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='light'>light</SelectItem>
                    <SelectItem value='dark'>dark</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

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

export { PrintedBookForm, PrintedBookEditForm };
