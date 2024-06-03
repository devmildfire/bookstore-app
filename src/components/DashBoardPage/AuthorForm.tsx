import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { Textarea } from '../ui/textarea';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { AuthorsType } from 'pages/dashboard/authors';
import { DateTimePicker } from '../ui/datetime-picker';
import { Checkbox } from '../ui/checkbox';
import slugify from 'slugify';
import { enumsArrayStore } from '@/store/locals/dashboard/EnumArrayStore/EnumArrayStore';
import { allEnums } from '@/utils/testfornode';

// console.log('all imported enums are ... ', allEnums);
console.log('all imported contact types are ... ', allEnums.contacttypes);

const isContactTypeValid = async (contactType: string): Promise<boolean> => {
  const isValid = enumsArrayStore.enums!.contacttypes.includes(contactType);

  return isValid;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const contactSchema = z.object({
  contactType: z.string().refine(
    async (contactType) => {
      return await isContactTypeValid(contactType);
    },
    { message: 'contact type must be valid' }
  ),
  contactContent: z.string(),
});

type contactObject = z.infer<typeof contactSchema>;

const contactSetSchema = z
  .array(contactSchema)
  .min(1, {
    message: `You need to add at least 1 contact`,
  })
  .max(10, {
    message: `You can add at most 10 contacts`,
  });

// const photoSchema = z.object({
//   photo: z
//     .instanceof(File, { message: 'Image is required.' })
//     .optional()
//     .refine(
//       (file) => !file || file?.size <= MAX_FILE_SIZE,
//       `Max file size is 5MB.`
//     )
//     .refine(
//       (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
//       '.jpg, .jpeg, .png and .webp files are accepted.'
//     ),
// });

// const photoSetSchema = z
//   .array(photoSchema)
//   .min(MIN_PHOTOSET_LENGTH, {
//     message: `You need to add at least ${MIN_PHOTOSET_LENGTH} student`,
//   })
//   .max(MAX_PHOTOSET_LENGTH, {
//     message: `You can add at most ${MAX_PHOTOSET_LENGTH} students`,
//   });

// type photoObject = z.infer<typeof photoSchema>;

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Author name must be at least 3 characters long.',
  }),
  bio: z.string().min(6, {
    message: 'Author bio must be at least 3 characters long.',
  }),
  birthDate: z
    .date({
      description: 'Author birth date',
    })
    .nullable()
    .optional(),
  deathDate: z
    .date({
      description: 'Author death date',
    })
    .nullable()
    .optional(),
  city: z.string().min(3, {
    message: 'Author city must be at least 3 characters long.',
  }),
  photo: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),

  phrase: z.string().min(3, {
    message: 'phrase must be least 3 characters.',
  }),
  nonsalable: z.boolean({ required_error: 'nonsalable condition is required' }),
  // contact: contactSchema,
  contacts: contactSetSchema,
});

const formEditSchema = z.object({
  bio: z.string().min(6, {
    message: 'Author bio must be at least 3 characters long.',
  }),
  birthDate: z
    .date({
      description: 'Author birth date',
    })
    .nullable()
    .optional(),
  deathDate: z
    .date({
      description: 'Author death date',
    })
    .nullable()
    .optional(),
  city: z.string().min(3, {
    message: 'Author city must be at least 3 characters long.',
  }),
  photo: z.any().optional(),
  phrase: z.string().min(3, {
    message: 'phrase must be least 3 characters.',
  }),
  nonsalable: z.boolean({ required_error: 'nonsalable condition is required' }),
  // contact: contactSchema,
  contacts: contactSetSchema,
});

type AuthorFormProps = {
  defaultName: string;
  defaultBio: string;
  defaultBirthDate: Date;
  defaultDeathDate: Date;
  defaultCity: string;
  defaultPhrase: string;
};

function AuthorForm(props: AuthorFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.defaultName,
      bio: props.defaultBio,
      city: props.defaultCity,
      phrase: props.defaultPhrase,
      nonsalable: false,
      contacts: [
        {
          contactType: 'e-mail',
          contactContent: 'example@example.com',
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
    name: 'contacts',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const photoUpload = await supabase.storage
      .from('authors')
      .upload(`author_${slugify(values.name)}`, values.photo, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('authors')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('Authors')
      .insert({
        name: values.name,
        birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
        death_date: values.deathDate ? values.deathDate.toUTCString() : null,
        phrase: values.phrase,
        photo: publicUrl,
        city: values.city,
        bio: values.bio,
        nonsalable: values.nonsalable,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к авторам`);
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
            name='nonsalable'
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
                  <FormLabel>Непродаваемый автор</FormLabel>
                </div>
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
            name='birthDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>birth date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('birthDate', null);

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
            name='deathDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>death date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('deathDate', null);

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
            name='city'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author City</FormLabel>
                <FormControl>
                  <Input placeholder='default city' {...field} />
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

          <FormField
            control={form.control}
            name='phrase'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Phrase</FormLabel>
                <FormControl>
                  <Input placeholder='some profound saying' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {fields.map((item, index) => (
            <div className='flex flex-row gap-4' key={`contactsKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`contacts.${index}.contactType`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Author Contact Type</FormLabel>
                    <Select
                      onValueChange={() => {
                        onChange;
                        append({
                          contactType: 'e-mail',
                          contactContent: 'kjkj',
                        });
                      }}
                      defaultValue={value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a contact type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {enumsArrayStore.enums &&
                          enumsArrayStore.enums.contacttypes.map((type) => (
                            <SelectItem key={type + index} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`contacts.${index}.contactContent`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-row items-start p-1'>
                    <FormLabel>Author Contact Content</FormLabel>
                    <FormControl>
                      <Input placeholder='.....' {...fieldProps} />
                    </FormControl>
                    {value && (
                      <Button
                        color='failure'
                        type='button'
                        onClick={() => {
                          console.log('removing input index ... ', index);
                          remove(index);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          {/* <div className='flex flex-row gap-4'>
            <FormField
              control={form.control}
              name='contacts.1.contactType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Contact Type</FormLabel>
                  <Select
                    onValueChange={() => {
                      field.onChange;
                      append({ contactType: '', contactContent: '' });
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a contact type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {enumsArrayStore.enums &&
                        enumsArrayStore.enums.contacttypes.map((type) => (
                          <SelectItem value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contacts.1.contactContent'
              render={({ field }) => (
                <FormItem className='flex flex-col items-start p-1'>
                  <FormLabel>Author Contact Content</FormLabel>
                  <FormControl>
                    <Input placeholder='.....' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}

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

function AuthorEditForm(author: AuthorsType) {
  const [newPhoto, setNewPhoto] = useState<string>();

  const photoImage = useRef<HTMLImageElement | null>(null);

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Authors')
      .select('*')
      .eq('id', author.id)
      .single();

    data && console.log('data from req is...', data);

    data &&
      (data.photo && setNewPhoto(data.photo),
      data.bio && form.setValue('bio', data.bio),
      data.city && form.setValue('city', data.city),
      data.phrase && form.setValue('phrase', data.phrase),
      data.birth_date && form.setValue('birthDate', new Date(data.birth_date)),
      data.death_date && form.setValue('deathDate', new Date(data.death_date)));
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      bio: author.bio ? author.bio : undefined,
      birthDate: author.birth_date ? new Date(author.birth_date) : undefined,
      deathDate: author.death_date ? new Date(author.death_date) : undefined,
      city: author.city ? author.city : undefined,
      // photo: undefined,
      phrase: author.phrase ? author.phrase : undefined,
      nonsalable: author.nonsalable,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);

    let imagePath = null;
    let publicUrl = null;

    if (author.photo && values.photo) {
      console.log('current author photo ... ', author.photo);

      const imageNameString = author.photo.split('/');

      console.log('image Name String ... ', imageNameString);

      console.log('selected photo file ... ', values.photo);

      const photoRemove = await supabase.storage
        .from('authors')
        .remove([imageNameString.slice(-1)[0]]);

      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);

      const fileName = values.photo?.name
        ? values.photo?.name
        : 'failNameString';
      console.log('photo is...', values.photo);
      console.log('photo name is...', values.photo?.name);

      const photoUdate = await supabase.storage
        .from('authors')
        .upload(`author_${slugify(author.name)}`, values.photo, {
          cacheControl: '3600',
          upsert: true,
        });

      photoUdate.error &&
        console.log('photo update error ... ', photoUdate.error.message);

      imagePath = photoUdate.data?.path;
      console.log('image path ... ', imagePath);
    }

    if (!author.photo && values.photo) {
      const photoUpload = await supabase.storage
        .from('authors')
        .upload(`author_${slugify(author.name)}`, values.photo, {
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

    console.log('public URL is ...', publicUrl);

    console.log('birth date is ...', values.birthDate);
    console.log(
      'birth date to base is ...',
      values.birthDate ? values.birthDate.toUTCString() : null
    );

    const { data, error } = await supabase
      .from('Authors')
      .update({
        birth_date: values.birthDate ? values.birthDate.toUTCString() : null,
        death_date: values.deathDate ? values.deathDate.toUTCString() : null,
        phrase: values.phrase,
        photo: publicUrl,
        city: values.city,
        bio: values.bio,
        nonsalable: values.nonsalable,
      })
      .eq('id', author.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`автор ${data.name} успешно обновлён`);
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
            name='nonsalable'
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
                  <FormLabel>Непродаваемый автор</FormLabel>
                </div>
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
            name='birthDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>birth date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('birthDate', null);

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
            name='deathDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>death date</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    showClearButton={true}
                    onNull={() => {
                      form.setValue('deathDate', null);

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
            name='city'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author City</FormLabel>
                <FormControl>
                  <Input
                    aria-label={'author city'}
                    placeholder='default city'
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
                  src={newPhoto || author.photo || ''}
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phrase'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Phrase</FormLabel>
                <FormControl>
                  <Input
                    aria-label={'author phrase'}
                    placeholder='some profound saying'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contacts.1.contactType'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Author Contact</FormLabel>
                <FormControl>
                  <Input placeholder='e-mail' {...field} />
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

export { AuthorForm, AuthorEditForm };
