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
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import slugify from 'slugify';
import { CoursesType, LectorsType } from 'pages/dashboard/courses';
import DeleteDialog from './DeleteDialog';

const MAX_COURSE_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ACCEPTED_COURSE_TYPES = ['application/zip'];

const lectorsOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const formSchema = z.object({
  lectors: z.array(lectorsOptionSchema).min(1),
  name: z.string().min(3, {
    message: 'Course name must be at least 3 characters long.',
  }),
  description: z.string().min(3, {
    message: 'description  must be at least 3 characters long.',
  }),
  duration: z.string().min(3, {
    message: 'duration  must be at least 3 characters long.',
  }),
  format: z.string().min(3, {
    message: 'format  must be at least 3 characters long.',
  }),
  thesis: z.string().min(3, {
    message: 'thesis  must be at least 3 characters long.',
  }),
  price: z.number().positive('must be positive'),
  discount: z
    .number()
    .gte(0, 'discount must be 0% or more')
    .max(100, 'maximum discount is 100%'),
  src: z
    .instanceof(File, { message: 'course zip file is required.' })
    .refine(
      (file) => file?.size <= MAX_COURSE_FILE_SIZE,
      `Max file size is 30MB.`
    )
    .refine(
      (file) => ACCEPTED_COURSE_TYPES.includes(file?.type),
      'only .zip files are accepted.'
    ),
});

const formEditSchema = z.object({
  lectors: z.array(lectorsOptionSchema).min(1),
  name: z.string().min(3, {
    message: 'Course name must be at least 3 characters long.',
  }),
  description: z.string().min(3, {
    message: 'description  must be at least 3 characters long.',
  }),
  duration: z.string().min(3, {
    message: 'duration  must be at least 3 characters long.',
  }),
  format: z.string().min(3, {
    message: 'format  must be at least 3 characters long.',
  }),
  thesis: z.string().min(3, {
    message: 'thesis  must be at least 3 characters long.',
  }),
  price: z.number().positive('must be positive'),
  discount: z
    .number()
    .gte(0, 'discount must be 0% or more')
    .max(100, 'maximum discount is 100%'),
  src: z
    .instanceof(File, { message: 'demo zip file is required.' })
    .optional()
    .refine(
      (file) => !file || file?.size <= MAX_COURSE_FILE_SIZE,
      `Max file size is 30MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_COURSE_TYPES.includes(file?.type),
      'only .zip files are accepted.'
    ),
});

type CourseFormProps = {
  lectors: LectorsType[];
};

function CourseForm({ lectors }: CourseFormProps) {
  const router = useRouter();

  const OPTIONS: Option[] = lectors.map((lector) => ({
    label: lector.name,
    value: lector.id.toString(),
    disable: false,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: '',
      format: '',
      thesis: '',
      price: 1000,
      discount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const time = Date.now();

    const fileString = `course_${slugify(values.name)}_${time}.zip`;

    const courseUpload = await supabase.storage
      .from('courses')
      .upload(fileString, values.src, {
        cacheControl: '3600',
        upsert: true,
      });

    const coursePublicUrl = fileString;

    // const coursePublicUrl = supabase.storage
    //   .from('courses')
    //   .getPublicUrl(`${courseUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('Courses')
      .insert({
        name: values.name,
        description: values.description,
        duration: values.duration,
        format: values.format,
        thesis: values.thesis,
        price: values.price,
        discount: values.discount,
        src: coursePublicUrl,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен курсам`);

    if (data) {
      const coursesLectorsArray = values.lectors.map((lector) => {
        const lectorID = parseInt(lector.value);
        const courseID = data?.id;

        return {
          lector_id: lectorID,
          course_id: courseID,
        };
      });

      const lectorsData = await supabase
        .from('Lectors_Courses')
        .insert(coursesLectorsArray)
        .select('*');
      lectorsData.error && window.alert(lectorsData.error.message);
      lectorsData.data &&
        window.alert(`Лекторы успешно добавлен к курсу ${data.name} `);

      form.reset({
        description: undefined,
        thesis: undefined,
        name: undefined,
        lectors: [],
        price: 0,
        duration: undefined,
        discount: 0,
        src: undefined,
      });

      router.reload();
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
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder='some Name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='src'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course archive file</FormLabel>
                <FormControl>
                  <Input
                    id='demoInput'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lectors'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lectors</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    defaultOptions={OPTIONS}
                    placeholder='Select authors for the title...'
                    emptyIndicator={
                      <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                        no results found.
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course description</FormLabel>
                <FormControl>
                  <Input placeholder='some description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='duration'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course duration</FormLabel>
                <FormControl>
                  <Input placeholder='some duration' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='format'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course format</FormLabel>
                <FormControl>
                  <Input placeholder='some format' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='thesis'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course thesis</FormLabel>
                <FormControl>
                  <Input placeholder='some thesis' {...field} />
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
                    min={0}
                    max={100}
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
            Добавить
          </Button>
        </form>
      </Form>
    </div>
  );
}

type CourseEditFormProps = {
  course: CoursesType;
  lectors: LectorsType[];
};

function CourseEditForm({ course, lectors }: CourseEditFormProps) {
  const OPTIONS: Option[] = lectors.map((lector) => ({
    label: lector.name,
    value: lector.id.toString(),
    disable: false,
  }));

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Courses')
      .select('*')
      .eq('id', course.id)
      .single();

    data && console.log('data from req is...', data);

    const lectorsData = await supabase
      .from('Lectors_Courses')
      .select('*, Lectors(*)')
      .eq('course_id', course.id);

    if (lectorsData.data) {
      console.log('lectors data from reference table... ', lectorsData.data);

      const lectorsArray = lectorsData.data.map((lector) => ({
        label: lector.Lectors ? lector.Lectors.name : 'emptyLabel',
        value: lector.Lectors ? lector.Lectors.id.toString() : 'emptyValue',
      }));

      form.setValue('lectors', lectorsArray);
    }
  }

  useEffect(() => {
    getDataFromReq();
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      name: course.name,
      description: course.description || undefined,
      duration: course.duration || undefined,
      thesis: course.thesis || undefined,
      format: course.format || undefined,
      price: course.price || undefined,
      discount: course.discount,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    let coursePath = null;
    let coursePublicUrl = null;

    let srcNameString = course.src?.split('/').pop() || 'no src';

    if (values.src) {
      console.log('current course src ... ', course.src);

      srcNameString = course.src?.split('/').pop() || 'no src';

      console.log('src Name String ... ', srcNameString);

      console.log('selected src file ... ', values.src);

      const courseRemove = await supabase.storage
        .from('courses')
        .remove([srcNameString]);

      courseRemove.error &&
        console.log('src Remove error ... ', courseRemove.error.message);

      courseRemove.data &&
        console.log('src Remove data... ', courseRemove.data);

      const courseUdate = await supabase.storage
        .from('courses')
        .upload(
          `course_${slugify(course.name)}_${time + 3475}.zip`,
          values.src,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      courseUdate.error &&
        console.log('src update error ... ', courseUdate.error.message);

      coursePath = courseUdate.data?.path;
      console.log('src path ... ', coursePath);
    }

    if (!values.src) {
      coursePath = course.src;
      coursePublicUrl = course.src;
    }

    // const privateUrl = supabase.storage
    // .from('courses')
    // .createSignedUrl(link, 600, { download: true });

    // (await privateUrl).data?.signedUrl || 'error link',

    !coursePublicUrl &&
      coursePath &&
      (coursePublicUrl = `course_${slugify(course.name)}_${time + 3475}.zip`);
    // (coursePublicUrl = supabase.storage
    //   .from('courses')
    //   .getPublicUrl(coursePath).data.publicUrl);

    console.log('public src URL is ...', coursePublicUrl);

    const { data, error } = await supabase
      .from('Courses')
      .update({
        name: values.name,
        description: values.description,
        duration: values.duration,
        format: values.format,
        thesis: values.thesis,
        price: values.price,
        discount: values.discount,
        src: coursePublicUrl,
      })
      .eq('id', course.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`Курс ${data.name} успешно обновлён`);

    const purgeLectors = await supabase
      .from('Lectors_Courses')
      .delete()
      .eq('course_id', course.id);

    !purgeLectors.error && console.log('old lectors deleted');

    if (data) {
      const coursesLectorsArray = values.lectors.map((lector) => {
        const lectorID = parseInt(lector.value);
        const courseID = data?.id;

        return {
          lector_id: lectorID,
          course_id: courseID,
        };
      });

      const lectorsData = await supabase
        .from('Lectors_Courses')
        .insert(coursesLectorsArray)
        .select('*');
      lectorsData.error && window.alert(lectorsData.error.message);
      lectorsData.data &&
        window.alert(`Лекторы успешно добавлены к тайтлу ${data.name} `);
    }

    data && router.reload();
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
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder='some Name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='src'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course archive file</FormLabel>

                <p>{course.src}</p>

                <a href={course.src!} download target='_blank'>
                  download file
                </a>
                <FormControl>
                  <Input
                    id='demoInput'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      return onChange(
                        event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lectors'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lectors</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    defaultOptions={OPTIONS}
                    placeholder='Select authors for the title...'
                    emptyIndicator={
                      <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                        no results found.
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course description</FormLabel>
                <FormControl>
                  <Input placeholder='some description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='duration'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course duration</FormLabel>
                <FormControl>
                  <Input placeholder='some duration' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='format'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course format</FormLabel>
                <FormControl>
                  <Input placeholder='some format' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='thesis'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Course thesis</FormLabel>
                <FormControl>
                  <Input placeholder='some thesis' {...field} />
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
                    min={0}
                    max={100}
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

          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog deleteFunction={deleteCourse} itemID={course.id} />
          </div>
        </form>
      </Form>
    </div>
  );
}

const deleteCourse = async (courseID: number) => {
  let success = false;

  const lectorsDelete = await supabase
    .from('Lectors_Courses')
    .delete()
    .eq('course_id', courseID);

  const { error } = await supabase.from('Courses').delete().eq('id', courseID);

  error && window.alert(error.message);
  !error &&
    !lectorsDelete.error &&
    (success = true) &&
    window.alert(`Курс номер ${courseID} успешно удалён`);

  return success;
};

export { CourseForm, CourseEditForm };
