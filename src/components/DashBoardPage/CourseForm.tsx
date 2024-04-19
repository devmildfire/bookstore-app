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
import { CoursesType } from 'pages/dashboard/courses';
import DeleteDialog from './DeleteDialog';
import { LectorsType } from './LectorForm';

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
      name: 'Some course',
      description: 'some course description',
      duration: 'шестнадцать часовых и три двухчасовых занятия',
      format: 'видеолекции',
      thesis: 'some thesis',
      price: 1234,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const { data, error } = await supabase
      .from('Courses')
      .insert({
        name: values.name,
        description: values.description,
        duration: values.duration,
        format: values.format,
        thesis: values.thesis,
        price: values.price,
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course.name,
      description: course.description || undefined,
      duration: course.duration || undefined,
      thesis: course.thesis || undefined,
      format: course.format || undefined,
      price: course.price || undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formSchema>) {
    console.log('values ... ', values);

    const { data, error } = await supabase
      .from('Courses')
      .update({
        name: values.name,
        description: values.description,
        duration: values.duration,
        format: values.format,
        thesis: values.thesis,
        price: values.price,
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
