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
import { UseFormReturn, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { Textarea } from '../ui/textarea';
import {
  ChangeEvent,
  Children,
  RefObject,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { TitleType } from 'pages/dashboard/titles';
import { AuthorsType } from 'pages/dashboard/authors';

import { DateTimePicker } from '../ui/datetime-picker';
import { Checkbox } from '../ui/checkbox';
import slugify from 'slugify';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import { AwardsType } from 'pages/dashboard/awards';

const MAX_VIDEO_FILE_SIZE = 58 * 1024 * 1024; //  50MB
const ACCEPTED_VIDEO_TYPES = [
  'video/x-msvideo',
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/mp2t',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
];

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const MAX_DEMO_FILE_SIZE = 30 * 1024 * 1024; // 30MB
const ACCEPTED_DEMO_TYPES = ['application/zip'];

const demoEditSchema = z
  .instanceof(File, { message: 'demo zip file is required.' })
  .optional()
  .refine(
    (file) => !file || file?.size <= MAX_DEMO_FILE_SIZE,
    `Max file size is 30MB.`
  )
  .refine(
    (file) => !file || ACCEPTED_DEMO_TYPES.includes(file?.type),
    'only .zip files are accepted.'
  );

const demoSchema = z
  .instanceof(File, { message: 'demo zip file is required.' })
  .refine((file) => file?.size <= MAX_DEMO_FILE_SIZE, `Max file size is 30MB.`)
  .refine(
    (file) => ACCEPTED_DEMO_TYPES.includes(file?.type),
    'only .zip files are accepted.'
  );

const authorsOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const awardsOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disable: z.boolean().optional(),
});

const videoSchema = z
  .instanceof(File, { message: 'Image is required.' })
  .optional()
  .refine(
    (file: any) => !file || file?.size <= MAX_VIDEO_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (file: any) => !file || ACCEPTED_VIDEO_TYPES.includes(file?.type),
    'wrong file type'
  );

const imageSchema = z
  .instanceof(File, { message: 'Image is required.' })
  .refine((file) => file?.size <= MAX_IMAGE_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
    '.jpg, .jpeg, .png and .webp files are accepted.'
  );

const imageOptionalSchema = z
  .instanceof(File, { message: 'Image is required.' })
  .optional()
  .refine(
    (file) => !file || file?.size <= MAX_IMAGE_FILE_SIZE,
    `Max file size is 5MB.`
  )
  .refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
    '.jpg, .jpeg, .png and .webp files are accepted.'
  );

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Title name must be at least 3 characters long.',
  }),
  awards: z.array(awardsOptionSchema).optional(),
  authors: z.array(authorsOptionSchema).min(1),
  description: z.string().min(6, {
    message: 'Title description must be at least 6 characters long.',
  }),
  thesis: z.string().min(6, {
    message: 'Title thesis must be at least 6 characters long.',
  }),
  trailer: videoSchema,
  first_release: z
    .date({
      description: 'first release date',
    })
    .nullable()
    .optional(),
  age_restriction: z.number().min(0, {
    message: 'Age restriction must be 0 or more',
  }),
  cover: imageSchema,
  is_featured: z.boolean().default(false).optional(),
  demo: demoSchema,
});

const formEditSchema = z.object({
  authors: z.array(authorsOptionSchema).min(1),
  awards: z.array(awardsOptionSchema).optional(),
  description: z.string().min(6, {
    message: 'Title description must be at least 6 characters long.',
  }),
  thesis: z.string().min(6, {
    message: 'Title thesis must be at least 6 characters long.',
  }),
  trailer: videoSchema,
  first_release: z
    .date({
      description: 'first release date',
    })
    .nullable()
    .optional(),
  age_restriction: z.number().min(0, {
    message: 'Age restriction must be 0 or more',
  }),
  cover: imageOptionalSchema,
  is_featured: z.boolean().default(false).optional(),
  demo: demoEditSchema,
});

type TitleFormProps = {
  authors: AuthorsType[];
  awards: AwardsType[];
  defaultName: string;
  defaultThesis: string;
  defaultDescription: string;
  defaultAgeRestriction: number;
  defaultFirstRelease: Date;
  defaultIsFeatured: boolean;
};

async function onVideoInputChange(
  event: ChangeEvent<HTMLInputElement>,
  videoRef: RefObject<HTMLVideoElement>
) {
  const videoInput = event.target;
  const tVideo = videoRef.current;

  if (videoInput.files) {
    const file = videoInput.files[0];
    if (file) {
      tVideo && (tVideo.src = URL.createObjectURL(file));
    }
  }
}

const emptyVideoInput = (
  videoInputRef: RefObject<HTMLInputElement>,
  videoRef: RefObject<HTMLVideoElement>
) => {
  const videoInput = videoInputRef.current;
  videoInput && (videoInput.value = '');

  const video = videoRef.current;
  video && (video.src = '');
};

async function onImageInputChange(
  event: ChangeEvent<HTMLInputElement>,
  photoRef: RefObject<HTMLImageElement>
) {
  const imageInput = event.target;
  const pImage = photoRef.current;

  if (imageInput.files) {
    const file = imageInput.files[0];
    if (file) {
      pImage && (pImage.src = URL.createObjectURL(file));
    }
  }
}

const emptyCoverInput = (
  photoInputRef: RefObject<HTMLInputElement>,
  photoImageRef: RefObject<HTMLImageElement>
) => {
  const coverInput = photoInputRef.current;
  coverInput && (coverInput.value = '');
  photoImageRef.current && (photoImageRef.current.src = '');
};

function TitleForm(props: TitleFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const trailerVideo = useRef<HTMLVideoElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const OPTIONS: Option[] = props.authors.map((author) => ({
    label: author.name,
    value: author.id.toString(),
    disable: false,
  }));

  const AWARDSOPTIONS: Option[] = props.awards.map((award) => ({
    label: award.title || 'default award title',
    value: award.id.toString(),
    disable: false,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.defaultName,
      thesis: props.defaultThesis,
      description: props.defaultDescription,

      age_restriction: props.defaultAgeRestriction,
      first_release: props.defaultFirstRelease,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const time = Date.now();

    emptyVideoInput(videoInputRef, trailerVideo);
    emptyCoverInput(photoInputRef, photoImage);

    const coverExtention = values.cover.name.split('.').pop();

    const photoUpload = await supabase.storage
      .from('titles')
      .upload(
        `titles_${slugify(values.name)}.${coverExtention}`,
        values.cover,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

    const publicUrl = supabase.storage
      .from('titles')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    let videoPublicUrl = null;

    if (values.trailer) {
      const trailerExtention = values.trailer.name.split('.').pop();

      const videoUpload = await supabase.storage
        .from('trailers')
        .upload(
          `trailers_${slugify(values.name)}.${trailerExtention}`,
          values.trailer,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      videoPublicUrl = supabase.storage
        .from('trailers')
        .getPublicUrl(`${videoUpload.data?.path}`).data.publicUrl;
    }

    const demoFileExtention = values.demo.name.split('.').pop();

    const demoUpload = await supabase.storage
      .from('demos')
      .upload(
        `demo_title_${slugify(values.name)}_${time}.${demoFileExtention}`,
        values.demo,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

    const demoPublicUrl = supabase.storage
      .from('demos')
      .getPublicUrl(`${demoUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('Titles')
      .insert({
        age_restriction: values.age_restriction,
        cover: publicUrl,
        description: values.description,
        first_release: values.first_release
          ? values.first_release.toUTCString()
          : null,
        is_featured: values.is_featured,
        name: values.name,
        slug: slugify(values.name),
        thesis: values.thesis,
        trailer: values.trailer ? videoPublicUrl : null,
        demo: demoPublicUrl,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к тайтлам`);

    if (data) {
      const titlesAuthorsArray = values.authors.map((author) => {
        const authorID = parseInt(author.value);
        const titleID = data?.id;

        return {
          author_id: authorID,
          title_id: titleID,
        };
      });

      if (values.awards) {
        const titlesAwardsArray = values.awards.map((award) => {
          const awardID = parseInt(award.value);
          const titleID = data?.id;

          return {
            award_id: awardID,
            title_id: titleID,
          };
        });

        const awardsData = await supabase
          .from('TitlesAwards')
          .insert(titlesAwardsArray)
          .select('*');
        awardsData.error && window.alert(awardsData.error.message);
        awardsData.data &&
          window.alert(`Награды успешно добавлен к тайтлу ${data.name} `);
      }

      const authorsData = await supabase
        .from('Titles_Authors')
        .insert(titlesAuthorsArray)
        .select('*');
      authorsData.error && window.alert(authorsData.error.message);
      authorsData.data &&
        window.alert(`Авторы успешно добавлен к тайтлу ${data.name} `);
    }

    form.reset({
      description: '',
      thesis: '',
      age_restriction: 0,
      cover: undefined,
      name: '',
      authors: [],
      awards: [],
      trailer: undefined,
      first_release: undefined,
      is_featured: false,
    });
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
                <FormLabel>Title Name</FormLabel>
                <FormControl>
                  <Input placeholder='someTitle' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='demo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>demo file</FormLabel>
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
            name='authors'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authors</FormLabel>
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
            name='awards'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Awards</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    defaultOptions={AWARDSOPTIONS}
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
                <FormLabel>Title Description</FormLabel>
                <FormControl>
                  <Textarea placeholder='' className='resize-none' {...field} />
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
                <FormLabel>Title Thesis</FormLabel>
                <FormControl>
                  <Textarea placeholder='' className='resize-none' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='first_release'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>first release</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('first_release', null);

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
            name='age_restriction'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Age Restriction</FormLabel>
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
                <FormLabel>Title Cover</FormLabel>
                <FormControl>
                  <Input
                    id='photo'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onImageInputChange(event, photoImage);
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
            name='trailer'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Trailer</FormLabel>
                <div className='flex flex-row items-start p-1'>
                  <FormControl>
                    <Input
                      id='video'
                      type='file'
                      {...fieldProps}
                      onChange={(event) => {
                        onVideoInputChange(event, trailerVideo);
                        return onChange(
                          event.target.files && event.target.files[0]
                        );
                      }}
                      ref={videoInputRef}
                    />
                  </FormControl>
                  <Button
                    type='button'
                    variant={'outline'}
                    onClick={() => {
                      emptyVideoInput(videoInputRef, trailerVideo);
                      form.setValue('trailer', undefined);
                    }}
                  >
                    clear
                  </Button>
                </div>
                <FormMessage />

                <video
                  className={value ? 'max-w-72' : 'max-w-72 hidden'}
                  ref={trailerVideo}
                  controls
                  src=''
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_featured'
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
                  <FormLabel>is featured</FormLabel>
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
            Добавить
          </Button>
        </form>
      </Form>
    </div>
  );
}

interface VideoContainerProps {
  children?: ReactNode;
  hasVideo: boolean;
}

function VideoContainer({ children, hasVideo }: VideoContainerProps) {
  return <div className={hasVideo ? '' : 'hidden'}>{children}</div>;
}

type TitleEditFormProps = {
  title: TitleType;
  authors: AuthorsType[];
  awards: AwardsType[];
};

function TitleEditForm({ title, authors, awards }: TitleEditFormProps) {
  // const [newPhoto, setNewPhoto] = useState<string>();
  const [hasVideo, setHasVideo] = useState(false);

  const photoImage = useRef<HTMLImageElement | null>(null);
  const trailerVideo = useRef<HTMLVideoElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const isVideoCleared = useRef(false);

  const OPTIONS: Option[] = authors.map((author) => ({
    label: author.name,
    value: author.id.toString(),
    disable: false,
  }));

  const AWARDSOPTIONS: Option[] = awards.map((award) => ({
    label: award.title || 'default award title',
    value: award.id.toString(),
    disable: false,
  }));

  async function getDataFromReq() {
    const { data } = await supabase
      .from('Titles')
      .select('*')
      .eq('id', title.id)
      .single();
    data && console.log('data from req is...', data);

    data &&
      (data.description && form.setValue('description', data.description),
      data.thesis && form.setValue('thesis', data.thesis),
      data.age_restriction
        ? form.setValue('age_restriction', data.age_restriction)
        : form.setValue('age_restriction', 0),
      // data.cover && setNewPhoto(data.cover),
      console.log('first release at...', data.first_release),
      data.first_release &&
        form.setValue('first_release', new Date(data.first_release)),
      data.is_featured !== null &&
        form.setValue('is_featured', data.is_featured),
      data.trailer && setHasVideo(true));

    const authorsData = await supabase
      .from('Titles_Authors')
      .select('*, Authors(*)')
      .eq('title_id', title.id);

    if (authorsData.data) {
      console.log('authors data from reference table... ', authorsData.data);

      const authorsArray = authorsData.data.map((author) => ({
        label: author.Authors ? author.Authors.name : 'emptyLabel',
        value: author.Authors ? author.Authors.id.toString() : 'emptyLabel',
      }));

      form.setValue('authors', authorsArray);
    }

    const awardsData = await supabase
      .from('TitlesAwards')
      .select('*, Awards(*)')
      .eq('title_id', title.id);

    if (awardsData.data) {
      console.log('awards data from reference table... ', awardsData.data);

      const awardsArray = awardsData.data.map((award) => ({
        label: award.Awards?.title ? award.Awards.title : 'emptyLabel',
        value: award.Awards ? award.Awards.id.toString() : 'emptyLabel',
      }));

      form.setValue('awards', awardsArray);
    }
  }
  useEffect(() => {
    getDataFromReq();
  }, []);
  const router = useRouter();
  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      description: title.description || undefined,
      thesis: title.thesis || undefined,
      first_release: title.first_release
        ? new Date(title.first_release)
        : undefined,
      is_featured: title.is_featured !== null ? title.is_featured : undefined,
      age_restriction: title.age_restriction || 0,
      // demo: title.demo || undefined,
    },
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    let imagePath = null;
    let publicUrl = null;

    let videoPath = null;
    let publicVideoUrl = null;

    if (title.cover && values.cover) {
      console.log('current title cover ... ', title.cover);
      const imageNameString = title.cover.split('/');
      console.log('image Name String ... ', imageNameString);
      console.log('selected cover file ... ', values.cover);
      const photoRemove = await supabase.storage
        .from('titles')
        .remove([imageNameString.slice(-1)[0]]);
      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);
      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);
      const fileName = values.cover?.name
        ? values.cover?.name
        : 'failNameString';
      console.log('photo is...', values.cover);
      console.log('photo name is...', values.cover?.name);
      const photoUdate = await supabase.storage
        .from('titles')
        .upload(`title_${fileName}`, values.cover, {
          cacheControl: '3600',
          upsert: true,
        });
      photoUdate.error &&
        console.log('photo update error ... ', photoUdate.error.message);
      imagePath = photoUdate.data?.path;
      console.log('image path ... ', imagePath);
    }

    if (title.cover && !values.cover) {
      imagePath = title.cover;
      publicUrl = title.cover;
    }
    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('titles').getPublicUrl(imagePath)
        .data.publicUrl);
    console.log('public URL is ...', publicUrl);

    const deleteOldVideo = async (oldTrailer: string) => {
      console.log('current title trailer ... ', title.trailer);
      const videoNameString = oldTrailer.split('/');
      console.log('video Name String ... ', videoNameString);
      console.log('selected trailer file ... ', values.trailer);
      const videoRemove = await supabase.storage
        .from('trailers')
        .remove([videoNameString.slice(-1)[0]]);
      videoRemove.error &&
        console.log('video Remove error ... ', videoRemove.error.message);
      videoRemove.data &&
        console.log('video Remove data... ', videoRemove.data);
    };

    const uploadNewVideo = async (newVideo: File) => {
      const fileName = newVideo.name ? newVideo.name : 'failNameString';
      console.log('video is...', values.trailer);
      console.log('video name is...', values.trailer?.name);
      const videoUpdate = await supabase.storage
        .from('trailers')
        .upload(`trailer_${fileName}`, newVideo, {
          cacheControl: '3600',
          upsert: true,
        });
      const videoError = videoUpdate.error?.message;
      console.log('video error is ... ', videoError);
      videoPath = videoUpdate.data?.path;
      console.log('video path ... ', videoPath);

      return videoPath;
    };

    if (title.trailer && (values.trailer || isVideoCleared.current)) {
      console.log('deleting old video .... ');
      await deleteOldVideo(title.trailer);
    }

    console.log('V & !C .... ', values.trailer && !isVideoCleared.current);

    if (values.trailer && !isVideoCleared.current) {
      console.log('uploading new video .... ');
      await uploadNewVideo(values.trailer);
    }

    if (isVideoCleared.current) {
      publicVideoUrl = null;
    }

    if (title.trailer && !values.trailer && !isVideoCleared.current) {
      videoPath = title.trailer;
      publicVideoUrl = title.trailer;
    }

    !publicVideoUrl &&
      videoPath &&
      (publicVideoUrl = supabase.storage
        .from('trailers')
        .getPublicUrl(videoPath).data.publicUrl);
    console.log('public video URL is ...', publicVideoUrl);

    let demoPath = null;
    let demoPublicUrl = null;

    if (values.demo) {
      console.log('current title demo ... ', title.demo);

      const demoNameString = title.demo?.split('/').pop() || 'no demo';

      console.log('demo Name String ... ', demoNameString);

      console.log('selected demo file ... ', values.demo);

      const demoRemove = await supabase.storage
        .from('demos')
        .remove([demoNameString]);

      demoRemove.error &&
        console.log('demo Remove error ... ', demoRemove.error.message);

      demoRemove.data && console.log('demo Remove data... ', demoRemove.data);

      const demoFileExtention = values.demo.name.split('.').pop();

      const demoUdate = await supabase.storage
        .from('demos')
        .upload(
          `demo_title_${slugify(title.name)}_${
            time + 3425
          }.${demoFileExtention}`,
          values.demo,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      demoUdate.error &&
        console.log('demo update error ... ', demoUdate.error.message);

      demoPath = demoUdate.data?.path;
      console.log('demo path ... ', demoPath);
    }

    if (!values.demo) {
      demoPath = title.demo;
      demoPublicUrl = title.demo;
    }

    !demoPublicUrl &&
      demoPath &&
      (demoPublicUrl = supabase.storage.from('demos').getPublicUrl(demoPath)
        .data.publicUrl);

    console.log('public demo URL is ...', demoPublicUrl);

    const { data, error } = await supabase
      .from('Titles')
      .update({
        age_restriction:
          values.age_restriction !== null ? values.age_restriction : 0,
        description: values.description && values.description,
        thesis: values.thesis && values.thesis,
        is_featured: values.is_featured !== null && values.is_featured,
        first_release: values.first_release
          ? values.first_release.toUTCString()
          : null,
        cover: publicUrl,
        trailer: publicVideoUrl,
        demo: demoPublicUrl,
      })
      .eq('id', title.id)
      .select('*')
      .single();
    error && window.alert(error.message);
    data && window.alert(`тайтл ${data.name} успешно обновлён`);

    const purgeAuthors = await supabase
      .from('Titles_Authors')
      .delete()
      .eq('title_id', title.id);

    !purgeAuthors.error && console.log('old authors deleted');

    if (data) {
      const titlesAuthorsArray = values.authors.map((author) => {
        const authorID = parseInt(author.value);
        const titleID = data?.id;

        return {
          author_id: authorID,
          title_id: titleID,
        };
      });

      const authorsData = await supabase
        .from('Titles_Authors')
        .insert(titlesAuthorsArray)
        .select('*');
      authorsData.error && window.alert(authorsData.error.message);
      authorsData.data &&
        window.alert(`Авторы успешно добавлен к тайтлу ${data.name} `);
    }

    const purgeAwards = await supabase
      .from('TitlesAwards')
      .delete()
      .eq('title_id', title.id);

    !purgeAwards.error && console.log('old awards deleted');

    if (data && values.awards) {
      const titlesAwardsArray = values.awards.map((award) => {
        const awardID = parseInt(award.value);
        const titleID = data?.id;

        return {
          award_id: awardID,
          title_id: titleID,
        };
      });

      const awardsData = await supabase
        .from('TitlesAwards')
        .insert(titlesAwardsArray)
        .select('*');
      awardsData.error && window.alert(awardsData.error.message);
      awardsData.data &&
        window.alert(`Награды успешно добавлен к тайтлу ${data.name} `);
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
            name='demo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>demo file</FormLabel>

                <p>{title.demo}</p>

                <a href={title.demo!} download target='_blank'>
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
            name='authors'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authors</FormLabel>
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
            name='awards'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Awards</FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={field.value}
                    onChange={field.onChange}
                    defaultOptions={AWARDSOPTIONS}
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
                <FormLabel>Title Description</FormLabel>
                <FormControl>
                  <Textarea
                    aria-label={'titleDescription'}
                    placeholder=''
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
            name='thesis'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Thesis</FormLabel>
                <FormControl>
                  <Textarea
                    aria-label={'titleThesis'}
                    placeholder=''
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
            name='first_release'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='datetime'>first release</FormLabel>
                <FormControl>
                  <DateTimePicker
                    jsDate={field.value}
                    onJsDateChange={field.onChange}
                    onNull={() => {
                      form.setValue('first_release', null);

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
            name='age_restriction'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Age Restriction</FormLabel>
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
                <FormLabel>Author Photo</FormLabel>
                <FormControl>
                  <Input
                    aria-label={'author photo'}
                    id='photo'
                    type='file'
                    {...fieldProps}
                    onChange={(event) => {
                      onImageInputChange(event, photoImage);
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
                  src={title.cover || ''}
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='trailer'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Title Trailer</FormLabel>
                <div className='flex flex-row items-start p-1'>
                  <FormControl>
                    <Input
                      id='video'
                      type='file'
                      {...fieldProps}
                      onChange={(event) => {
                        onVideoInputChange(event, trailerVideo);
                        setHasVideo(true);
                        isVideoCleared.current = false;

                        return onChange(
                          event.target.files && event.target.files[0]
                        );
                      }}
                      ref={videoInputRef}
                    />
                  </FormControl>
                  <Button
                    type='button'
                    variant={'outline'}
                    onClick={() => {
                      emptyVideoInput(videoInputRef, trailerVideo);
                      form.setValue('trailer', undefined);
                      setHasVideo(false);
                      isVideoCleared.current = true;
                    }}
                  >
                    clear ({' '}
                    {isVideoCleared.current ? 'IS CLEARED' : 'NOT CLEARED'} )
                  </Button>
                </div>
                <FormMessage />

                <VideoContainer hasVideo={hasVideo}>
                  <video
                    className='max-w-72'
                    ref={trailerVideo}
                    controls
                    // src=''
                    src={title.trailer || ''}
                  />
                </VideoContainer>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='is_featured'
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
                  <FormLabel>is featured</FormLabel>
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

export { TitleForm, TitleEditForm };
