import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  UseFormReturn,
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
  EbookType,
  CardBookType,
  FullPrintedBookType,
  PrintedBookType,
} from 'pages/dashboard/editions';

import { Database } from 'api/books/types';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import slugify from 'slugify';
import DeleteDialog from './DeleteDialog';

type PrintOptionsDataType =
  Database['public']['Tables']['PrintOptions']['Insert'];
type PrintSizeDataType = Database['public']['Tables']['PrintSize']['Insert'];
type PrintedBookInsertType =
  Database['public']['Tables']['PrintedBooks']['Insert'];
type coverDataType = Database['public']['Tables']['PrintedCover']['Insert'];
type AudioBookInsertType = Database['public']['Tables']['Audiobooks']['Insert'];
type PhotosRowInsert = Database['public']['Tables']['Photos']['Insert'];

type eBookInsertType = Database['public']['Tables']['Ebooks']['Insert'];
type CardBookInsertType = Database['public']['Tables']['CardBooks']['Insert'];

type CategoryType = Database['public']['Enums']['category'];

const MAX_FILE_SIZE = 50 * 1024 * 1024; //  50MB
const MAX_AUDIO_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_EBOOK_FILE_SIZE = 250 * 1024 * 1024; // 250MB
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

const ACCEPTED_EBOOK_TYPES = [
  'text/fb2+xml',
  'application/epub+zip',
  'application/x-mobipocket-ebook',
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

type photoObject = z.infer<typeof photoSchema>;

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
  sold_out: z.boolean({ required_error: 'sold out condition is required' }),
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
  cover: z.any().optional(),
  pages: z.number().positive('must be positive'),
  discount: z.number().gte(0, 'discount must be 0 or greater'),
  sold: z.number().gte(0, 'sold copies number must be 0 or greater'),
  sold_out: z.boolean({ required_error: 'sold out condition is required' }),
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
  photos: photoSetSchema,
});

const ebookFormSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his audiobook counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  ISBN: z.string().min(3, {
    message: 'ISBN must be at least 3 characters long.',
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
  characters: z.number().positive('must be positive'),
  src: z
    .instanceof(File, { message: 'EBook file is required.' })
    .refine(
      (file) => file?.size <= MAX_EBOOK_FILE_SIZE,
      `Max file size is ${MAX_EBOOK_FILE_SIZE}MB.`
    )
    .refine(
      (file) => ACCEPTED_EBOOK_TYPES.includes(file?.type),
      '.fb2, .epub, .mobi and .zip files are accepted.'
    ),
  photos: photoSetSchema,
});

const eBookFormEditSchema = z.object({
  counter_color: z.string({
    required_error: 'Author must pick a color for his audiobook counter.',
  }),
  extra: z.string().min(6, {
    message: 'Extra info must be at least 6 characters long.',
  }),
  ISBN: z.string().min(3, {
    message: 'ISBN must be at least 3 characters long.',
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
  characters: z.number().positive('must be positive'),
  src: z.any().optional(),
  photos: photoSetSchema,
});

const cardBookFormSchema = z.object({
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
  sold_out: z.boolean({ required_error: 'sold out condition is required' }),
  photos: photoSetSchema,
});

const cardBookEditFormSchema = z.object({
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
  sold_out: z.boolean({ required_error: 'sold out condition is required' }),
  photos: photoSetSchema,
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
  demo: z
    .instanceof(File, { message: 'Demo Audio file is required.' })
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
  audio: z
    .instanceof(File, { message: 'Audio file is required.' })
    .optional()
    .refine(
      (file) => !file || file?.size <= MAX_AUDIO_FILE_SIZE,
      `Max file size is ${MAX_AUDIO_FILE_SIZE}.`
    )
    .refine(
      (file) => !file || ACCEPTED_AUDIO_TYPES.includes(file?.type),
      '.mp3, .wav, .ogg and .zip files are accepted.'
    ),
  demo: z
    .instanceof(File, { message: 'Audio Demo file is required.' })
    .optional()
    .refine(
      (file) => !file || file?.size <= MAX_AUDIO_FILE_SIZE,
      `Max file size is ${MAX_AUDIO_FILE_SIZE}.`
    )
    .refine(
      (file) => !file || ACCEPTED_AUDIO_TYPES.includes(file?.type),
      '.mp3, .wav, .ogg and .zip files are accepted.'
    ),
});

async function setPhotoData(
  titleID: number,
  titleName: string,
  bookType: CategoryType,
  photoSet: photoObject[]
) {
  const PhotosRowArray: PhotosRowInsert[] = [];
  let publicUrl = '';
  let photosRow: PhotosRowInsert;

  if (photoSet) {
    photoSet.forEach(async (item, index) => {
      const file = item.photo || null;
      console.log('current photoSet file is...', file);
      if (file) {
        const fileExt = file.name.split('.').pop();

        const photoUpload = await supabase.storage
          .from('photos')
          .upload(
            `photo_${slugify(titleName)}_${bookType}_${index}.${fileExt}`,
            file,
            {
              cacheControl: '3600',
              upsert: true,
            }
          );

        photoUpload.data &&
          (console.log('photoUpload data is...', photoUpload.data),
          (publicUrl = supabase.storage
            .from('photos')
            .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl),
          console.log('publicUrl is...', publicUrl),
          (photosRow = {
            category: bookType,
            source: publicUrl,
            title_id: titleID,
          }),
          console.log('photosRow is...', photosRow),
          PhotosRowArray.push(photosRow));

        const { data, error } = await supabase
          .from('Photos')
          .insert({
            category: bookType,
            source: publicUrl,
            title_id: titleID,
          })
          .select('*');
        console.log('photo data is...', data);
      }
    });
    return PhotosRowArray;
  }

  return null;
}

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

const setEBookData = async (eBookData: eBookInsertType) => {
  const newEBook = await supabase
    .from('Ebooks')
    .insert(eBookData)
    .select('*')
    .single();

  newEBook.error && window.alert(newEBook.error.message);
  newEBook.data &&
    window.alert(`${newEBook.data.id} успешно добавлен к цифровым книгам`);

  if (newEBook.data) {
    return newEBook.data.id;
  } else {
    return null;
  }
};

const updateEBookData = async (id: number, eBookData: eBookInsertType) => {
  const eBook = await supabase
    .from('Ebooks')
    .update(eBookData)
    .eq('id', id)
    .select('*')
    .single();

  eBook.error && window.alert(eBook.error.message);
  eBook.data && window.alert(`Цифровая книга${eBook.data.id} успешно изменена`);

  if (eBook.data) {
    return eBook.data.id;
  } else {
    return null;
  }
};

const setCardBookData = async (cardBookData: CardBookInsertType) => {
  const newCardBook = await supabase
    .from('CardBooks')
    .insert(cardBookData)
    .select('*')
    .single();

  newCardBook.error && window.alert(newCardBook.error.message);
  newCardBook.data &&
    window.alert(`${newCardBook.data.id} успешно добавлен к книгам 2.0`);

  if (newCardBook.data) {
    return newCardBook.data.id;
  } else {
    return null;
  }
};

const updateCardBookData = async (
  id: number,
  cardBookData: CardBookInsertType
) => {
  const cardBook = await supabase
    .from('CardBooks')
    .update(cardBookData)
    .eq('id', id)
    .select('*')
    .single();

  cardBook.error && window.alert(cardBook.error.message);
  cardBook.data &&
    window.alert(`Книга 2.0 ${cardBook.data.id} успешно изменена`);

  if (cardBook.data) {
    return cardBook.data.id;
  } else {
    return null;
  }
};

const getCardBookByID = async (cardBookID: number) => {
  const cardBook = await supabase
    .from('CardBooks')
    .select('*')
    .eq('id', cardBookID)
    .single();

  return cardBook.data ? cardBook.data : null;
};

const deleteCardBook = async (cardBookID: number) => {
  const cardBook = await getCardBookByID(cardBookID);

  let deletedPhotos;
  let deletedLinks;
  if (cardBook) {
    deletedPhotos = await deleteStoredPhotos(cardBook.title_id, 'Book2.0');
    console.log('deleted photos of Book2.0 from storage...', deletedPhotos);
    deletedLinks = await deleteDBPhotoLinks(cardBook.title_id, 'Book2.0');
    console.log(
      'deleted photo links for Book2.0 from Photos table...',
      deletedLinks
    );
  }

  const { error } = await supabase
    .from('CardBooks')
    .delete()
    .eq('id', cardBookID);

  error && deletedPhotos && deletedLinks && window.alert(error.message);
  !error && window.alert(`Книга 2.0 номер ${cardBookID} успешно удалена`);

  return !error ? true : false;
};

const getTitleByEBookID = async (eBookID: number) => {
  let titleName: string;
  const titleID = await supabase
    .from('Ebooks')
    .select('title_id')
    .eq('id', eBookID)
    .single();

  if (titleID.data && titleID.data.title_id) {
    titleName = await getTitleName(titleID.data.title_id);
    return { title: titleName, titleID: titleID.data.title_id };
  } else {
    return null;
  }
};

const getEBookByID = async (eBookID: number) => {
  const eBook = await supabase
    .from('Ebooks')
    .select('*')
    .eq('id', eBookID)
    .single();

  return eBook.data ? eBook.data : null;
};

const deleteEBook = async (eBookID: number) => {
  let success = false;
  const eBook = await getEBookByID(eBookID);

  const titleObj = eBook && (await getTitleByEBookID(eBook.id));
  let deletedPhotos;
  let deletedLinks;
  if (titleObj) {
    deletedPhotos = await deleteStoredPhotos(titleObj.titleID, 'EBook');
    console.log('deleted photos of EBook from storage...', deletedPhotos);
    deletedLinks = await deleteDBPhotoLinks(titleObj.titleID, 'EBook');
    console.log(
      'deleted photo links for EBook from Photos table...',
      deletedLinks
    );
  }

  const fileNameString = (eBook && eBook.src?.split('/').pop()) || 'no file';
  const eBookRemove = await supabase.storage
    .from('ebooks')
    .remove([fileNameString]);

  if (eBook) {
    const { error } = await supabase.from('Ebooks').delete().eq('id', eBook.id);

    error && window.alert(error.message);
    !error &&
      deletedPhotos &&
      deletedLinks &&
      !eBookRemove.error &&
      (success = true) &&
      window.alert(`Цифровая книга номер ${eBook.id} успешно удалена`);
  }

  return success;
};

const getPrintedBookByID = async (bookID: number) => {
  const book = await supabase
    .from('PrintedBooks')
    .select('*, cover: PrintedCover(*)')
    .eq('id', bookID)
    .single();

  return book.data ? book.data : null;
};

const deletePrintedBook = async (bookID: number) => {
  let success = false;
  const book = await getPrintedBookByID(bookID);

  // const titleObj = book && (await getTitleByPrintedBookID(book.id));
  let deletedPhotos;
  let deletedLinks;
  if (book) {
    deletedPhotos = await deleteStoredPhotos(book.title_id, 'PrintBook');
    console.log(
      'deleted photos of Printed Book from storage...',
      deletedPhotos
    );
    deletedLinks = await deleteDBPhotoLinks(book.title_id, 'PrintBook');
    console.log(
      'deleted photo links for Printed Book from Photos table...',
      deletedLinks
    );
  }

  const fileNameString =
    (book && book.cover[0].source?.split('/').pop()) || 'no file';
  const coverRemove = await supabase.storage
    .from('covers')
    .remove([fileNameString]);

  if (book) {
    const { error } = await supabase
      .from('PrintedBooks')
      .delete()
      .eq('id', book.id);

    error && window.alert(error.message);
    !error &&
      deletedPhotos &&
      deletedLinks &&
      !coverRemove.error &&
      (success = true) &&
      window.alert(`Печатная книга номер ${book.id} успешно удалена`);
  }

  return success;
};

const getAudioBookByID = async (audioBookID: number) => {
  const audioBook = await supabase
    .from('Audiobooks')
    .select('*')
    .eq('id', audioBookID)
    .single();

  return audioBook.data ? audioBook.data : null;
};

const deleteAudioBook = async (audioBookID: number) => {
  let success = false;
  const audioBook = await getAudioBookByID(audioBookID);

  const fileNameString =
    (audioBook && audioBook.src?.split('/').pop()) || 'no file';
  const audioBookRemove = await supabase.storage
    .from('audiobooks')
    .remove([fileNameString]);

  const demoFileNameString =
    (audioBook && audioBook.demo?.split('/').pop()) || 'no file';
  const demoAudioBookRemove = await supabase.storage
    .from('demos')
    .remove([demoFileNameString]);

  if (audioBook) {
    const { error } = await supabase
      .from('Audiobooks')
      .delete()
      .eq('id', audioBook.id);

    error && window.alert(error.message);
    !error &&
      !audioBookRemove.error &&
      (success = true) &&
      window.alert(`Аудиокнига номер ${audioBook.id} успешно удалена`);
  }

  return success;
};

async function getTitleName(id: number) {
  const { data } = await supabase
    .from('Titles')
    .select('*')
    .eq('id', id)
    .single();

  return data ? data.name : '';
}

function EBookForm({ titleID }: { titleID: number }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof ebookFormSchema>>({
    resolver: zodResolver(ebookFormSchema),
    defaultValues: {
      counter_color: '#0800ffF',
      extra: 'some text',
      is_published: false,
      discount: 0,
      price: 100,
      publish_date: new Date(),
      release_date: new Date(),
      characters: 9001,
      sold: 0,
      photos: [
        {
          photo: undefined,
        },
      ],
    },
  });

  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'photos',
  });

  async function onSubmit(values: z.infer<typeof ebookFormSchema>) {
    console.log(values);
    const time = Date.now();

    const titleName = await getTitleName(titleID);
    console.log('title name is... ', titleName);

    const PhotosRowArray = await setPhotoData(
      titleID,
      titleName,
      'EBook',
      values.photos
    );
    console.log('photosRowArray is...', PhotosRowArray);

    const fileExtention = values.src.name.split('.').pop();

    const fileString = `ebook_${slugify(titleName)}.${fileExtention}`;

    const eBookUpload = await supabase.storage
      .from('ebooks')
      .upload(fileString, values.src, {
        cacheControl: '3600',
        upsert: true,
      });

    // const publicUrl = supabase.storage
    //   .from('ebooks')
    //   .getPublicUrl(`${eBookUpload.data?.path}`).data.publicUrl;

    const publicUrl = fileString;

    console.log('URL is... ', publicUrl);

    const eBookData = {
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
      file_volume: values.src.size,
      characters: values.characters,
      ISBN: values.ISBN,
    };

    const eBookID = await setEBookData(eBookData);
    console.log('new eBook ID is ...', eBookID);
    eBookID && router.reload();
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
                    ariaLabel='publish-date'
                  />
                </FormControl>
                <FormDescription>editions publish date.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
            aria-label='publish_date'
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
            name='src'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>eBook file</FormLabel>
                <FormControl>
                  <Input
                    id='src'
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
            name='characters'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Characters</FormLabel>
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

          {fields.map((item, index) => (
            <div className='block' key={`photosKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`photos.${index}.photo`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>eBook photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <Input
                        id={`photos.${index}`}
                        type='file'
                        {...fieldProps}
                        onChange={(event) => {
                          onPhotoInputChange(event, `photosImage.${item.id}`);
                          append({ photo: undefined });
                          return onChange(
                            event.target.files && event.target.files[0]
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <img
                      id={`photosImage.${item.id}`}
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
                onClick={() => {
                  console.log('removing inout index ... ', index);
                  remove(index);
                }}
              >
                Delete
              </Button>
            </div>
          ))}

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-64'
          >
            Добавить Цифровую Книгу
          </Button>
        </form>
      </Form>
    </div>
  );
}

function EBookEditForm(ebook: EbookType) {
  const router = useRouter();
  const effectRan = useRef(false);
  const oldVal = useRef<File | undefined>();
  const downloadURL = useRef<string>('');

  const setPhotoInputValue = (file: File, index: number) => {
    const inputTag = document.getElementById(
      `photos.${index}`
    ) as HTMLInputElement;
    console.log('image element', inputTag);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    inputTag.files && (inputTag.files = dataTransfer.files);

    form.setValue(`photos.${index}.photo`, file);
  };

  async function getDataFromReq() {
    const photosInitArray = await getInitPhotosArray(ebook.title_id, 'EBook');

    console.log('new photosInitArray', photosInitArray);

    const photoNumber = photosInitArray.length;

    for (let i = 0; i < photoNumber; i++) {
      const photoFile = await getFileByURL(photosInitArray[i].photo);
      setPhotoInputValue(photoFile, i);
      setPhotoImageSRC(photosInitArray[i].photo, i);
      append({ photo: undefined });
    }
  }

  const getDownloadURL = async () => {
    const downloadData = await supabase.storage
      .from('ebooks')
      .createSignedUrl(ebook.src || '', 600, { download: true });

    if (downloadData.data) {
      downloadURL.current = downloadData.data.signedUrl;
    }
  };

  useEffect(() => {
    getDownloadURL();

    if (!effectRan.current) {
      getDataFromReq();
    }
    return () => {
      effectRan.current = true;
    };
  }, []);

  const form = useForm<z.infer<typeof eBookFormEditSchema>>({
    resolver: zodResolver(eBookFormEditSchema),
    defaultValues: {
      is_published:
        ebook.is_published !== null ? ebook.is_published : undefined,
      publish_date: ebook.publish_date
        ? new Date(ebook.publish_date)
        : undefined,
      release_date: ebook.release_date
        ? new Date(ebook.release_date)
        : undefined,
      counter_color: ebook.counter_color || '#ff2a00',
      characters: ebook.characters || 0,
      extra: ebook.extra || '',
      discount: ebook.discount !== null ? ebook.discount : undefined,
      sold: ebook.sold !== null ? ebook.sold : undefined,
      price: ebook.price !== null ? ebook.price : undefined,
      ISBN: ebook.ISBN || '',
      photos: [{ photo: undefined }],
    },
  });

  const { control } = form;

  // Create dynamic forms
  const { fields, append, prepend, remove } = useFieldArray({
    control,
    name: 'photos',
  });

  async function onEditSubmit(values: z.infer<typeof eBookFormEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    const titleName = await getTitleName(ebook.title_id);

    if (values.photos) {
      deleteStoredPhotos(ebook.title_id, 'EBook');
      const deleted = await deleteDBPhotoLinks(ebook.title_id, 'EBook');
      console.log('links deleted...', deleted);

      const uploadedPhotos = await setPhotoData(
        ebook.title_id,
        titleName,
        'EBook',
        values.photos
      );
    }

    let eBookPath = null;
    let publicUrl = null;

    let fileNameString = ebook.src?.split('/').pop() || 'no file';
    let fileExtention = fileNameString.split('.').pop();

    if (values.src) {
      console.log('current ebook file ... ', ebook.src);

      fileNameString = ebook.src?.split('/').pop() || 'no file';

      console.log('ebook Name String ... ', fileNameString);

      console.log('selected eBook file ... ', values.src);

      const eBookRemove = await supabase.storage
        .from('ebooks')
        .remove([fileNameString]);

      eBookRemove.error &&
        console.log('eBook Remove error ... ', eBookRemove.error.message);

      eBookRemove.data &&
        console.log('eBook Remove data... ', eBookRemove.data);

      const fileName = values.src.name ? values.src.name : 'failNameString';
      console.log('eBook file is...', values.src);
      console.log('eBook file name is...', values.src.name);

      fileExtention = fileName.split('.').pop();

      console.log('title name is... ', titleName);

      const eBookUpdate = await supabase.storage
        .from('ebooks')
        .upload(`ebook_${slugify(titleName)}.${fileExtention}`, values.src, {
          cacheControl: '3600',
          upsert: true,
        });

      eBookUpdate.error &&
        console.log('eBook update error ... ', eBookUpdate.error.message);

      eBookPath = eBookUpdate.data?.path;
      console.log('eBook path ... ', eBookPath);
    }

    if (!values.src) {
      eBookPath = ebook.src;
      publicUrl = ebook.src;
    }

    !publicUrl &&
      eBookPath &&
      (publicUrl = `ebook_${slugify(titleName)}.${fileExtention}`);
    // (publicUrl = supabase.storage.from('ebooks').getPublicUrl(eBookPath)
    //   .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const eBookData = {
      title_id: ebook.title_id,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      src: publicUrl,
      file_volume: values.src?.size || ebook.file_volume,
      characters: values.characters,
      ISBN: values.ISBN,
    };

    const eBookID = await updateEBookData(ebook.id, eBookData);

    router.reload();
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
            name='src'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>eBook file</FormLabel>

                <p>{ebook.src}</p>

                <a href={downloadURL.current} download target='_blank'>
                  download file
                </a>

                <FormControl>
                  <Input
                    id='cover'
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
            name='characters'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Characters</FormLabel>
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

          {fields.map((item, index) => (
            <div className='block' key={`photosKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`photos.${index}.photo`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>eBook photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <div className='flex flex-row'>
                        <Input
                          id={`photos.${index}`}
                          type='file'
                          {...fieldProps}
                          onFocus={() => {
                            oldVal.current = value;
                            console.log('old value is... ', oldVal.current);
                          }}
                          onChange={(event) => {
                            onPhotoInputChange(event, `photosImage.${index}`);

                            oldVal.current === undefined &&
                              append({ photo: undefined });

                            return onChange(
                              event.target.files && event.target.files[0]
                            );
                          }}
                        />
                        {value && (
                          <Button
                            color='failure'
                            type='button'
                            onClick={() => {
                              console.log('removing inout index ... ', index);
                              remove(index);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
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
            </div>
          ))}
          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog deleteFunction={deleteEBook} itemID={ebook.id} />
          </div>
        </form>
      </Form>
    </div>
  );
}

function CardBookForm({ titleID }: { titleID: number }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof cardBookFormSchema>>({
    resolver: zodResolver(cardBookFormSchema),
    defaultValues: {
      counter_color: '#0800ffF',
      extra: 'some text',
      is_published: false,
      discount: 0,
      price: 100,
      publish_date: new Date(),
      release_date: new Date(),
      sold: 0,
      sold_out: false,
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

  async function onSubmit(values: z.infer<typeof cardBookFormSchema>) {
    console.log(values);
    const time = Date.now();

    const titleName = await getTitleName(titleID);

    const PhotosRowArray = await setPhotoData(
      titleID,
      titleName,
      'Book2.0',
      values.photos
    );

    console.log('photosRowArray is...', PhotosRowArray);

    const cardBookData = {
      title_id: titleID,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      sold_out: values.sold_out,
    };

    const cardBookID = await setCardBookData(cardBookData);
    console.log('new cardBook ID is ...', cardBookID);
    cardBookID && router.reload();
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
            name='sold_out'
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
                  <FormLabel>Нет в наличии</FormLabel>
                </div>
              </FormItem>
            )}
          />

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
                    ariaLabel='publish-date'
                  />
                </FormControl>
                <FormDescription>editions publish date.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
            aria-label='publish_date'
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

          {fields.map((item, index) => (
            <div className='block' key={`photosKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`photos.${index}.photo`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>book photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <Input
                        id={`photos.${index}`}
                        type='file'
                        {...fieldProps}
                        onChange={(event) => {
                          onPhotoInputChange(event, `photosImage.${item.id}`);
                          append({ photo: undefined });
                          return onChange(
                            event.target.files && event.target.files[0]
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <img
                      id={`photosImage.${item.id}`}
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
                onClick={() => {
                  console.log('removing inout index ... ', index);
                  remove(index);
                }}
              >
                Delete
              </Button>
            </div>
          ))}

          <Button
            type='submit'
            variant={'outline'}
            size={'default'}
            className='w-full max-w-64'
          >
            Добавить Книгу 2.0
          </Button>
        </form>
      </Form>
    </div>
  );
}

function CardBookEditForm(cardBook: CardBookType) {
  const router = useRouter();
  const effectRan = useRef(false);
  const oldVal = useRef<File | undefined>();

  const setPhotoInputValue = (file: File, index: number) => {
    const inputTag = document.getElementById(
      `photos.${index}`
    ) as HTMLInputElement;
    console.log('image element', inputTag);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    inputTag.files && (inputTag.files = dataTransfer.files);

    form.setValue(`photos.${index}.photo`, file);
  };

  async function getDataFromReq() {
    const photosInitArray = await getInitPhotosArray(
      cardBook.title_id,
      'Book2.0'
    );

    console.log('new photosInitArray', photosInitArray);

    const photoNumber = photosInitArray.length;

    for (let i = 0; i < photoNumber; i++) {
      const photoFile = await getFileByURL(photosInitArray[i].photo);

      setPhotoInputValue(photoFile, i);

      setPhotoImageSRC(photosInitArray[i].photo, i);
      console.log(`prepending item ${i + 1}`);
      append({ photo: undefined });
    }
  }

  useEffect(() => {
    if (!effectRan.current) {
      getDataFromReq();
    }
    return () => {
      effectRan.current = true;
    };
  }, []);

  const form = useForm<z.infer<typeof cardBookEditFormSchema>>({
    resolver: zodResolver(cardBookEditFormSchema),
    defaultValues: {
      is_published:
        cardBook.is_published !== null ? cardBook.is_published : undefined,
      publish_date: cardBook.publish_date
        ? new Date(cardBook.publish_date)
        : undefined,
      release_date: cardBook.release_date
        ? new Date(cardBook.release_date)
        : undefined,
      counter_color: cardBook.counter_color || '#ff2a00',
      extra: cardBook.extra || '',
      discount: cardBook.discount !== null ? cardBook.discount : undefined,
      sold: cardBook.sold !== null ? cardBook.sold : undefined,
      sold_out: cardBook.sold_out !== null ? cardBook.sold_out : undefined,
      price: cardBook.price !== null ? cardBook.price : undefined,
      photos: [{ photo: undefined }],
    },
  });

  // Get properties from react hook form
  const {
    control,
    // handleSubmit,
    // formState: { errors },
  } = form;

  // Create dynamic forms
  const { fields, append, prepend, remove } = useFieldArray({
    control,
    name: 'photos',
  });

  async function onEditSubmit(values: z.infer<typeof cardBookEditFormSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    const titleName = await getTitleName(cardBook.title_id);

    if (values.photos) {
      deleteStoredPhotos(cardBook.title_id, 'Book2.0');
      const deleted = await deleteDBPhotoLinks(cardBook.title_id, 'Book2.0');
      console.log('links deleted...', deleted);

      const uploadedPhotos = await setPhotoData(
        cardBook.title_id,
        titleName,
        'Book2.0',
        values.photos
      );
    }

    const cardBookData = {
      title_id: cardBook.title_id,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      sold_out: values.sold_out,
    };

    const cardBookID = await updateCardBookData(cardBook.id, cardBookData);

    router.reload();
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
            name='sold_out'
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
                  <FormLabel>Нет в наличии</FormLabel>
                </div>
              </FormItem>
            )}
          />

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

          {fields.map((item, index) => (
            <div className='block' key={`photosKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`photos.${index}.photo`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>book photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <div className='flex flex-row'>
                        <Input
                          id={`photos.${index}`}
                          type='file'
                          {...fieldProps}
                          onFocus={() => {
                            oldVal.current = value;
                            console.log('old value is... ', oldVal.current);
                          }}
                          onChange={(event) => {
                            onPhotoInputChange(event, `photosImage.${index}`);

                            oldVal.current === undefined &&
                              append({ photo: undefined });

                            return onChange(
                              event.target.files && event.target.files[0]
                            );
                          }}
                        />
                        {value && (
                          <Button
                            color='failure'
                            type='button'
                            onClick={() => {
                              console.log('removing inout index ... ', index);
                              remove(index);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
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
            </div>
          ))}

          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog
              deleteFunction={deleteCardBook}
              itemID={cardBook.id}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

function AudioBookForm({ titleID }: { titleID: number }) {
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const demoAudioPlayer = useRef<HTMLAudioElement | null>(null);

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

    const time = Date.now();

    const titleName = await getTitleName(titleID);
    console.log('title name is... ', titleName);

    const fileExtention = values.audio.name.split('.').pop();

    const fileString = `audio_${slugify(titleName)}_${time}.${fileExtention}`;

    const audioUpload = await supabase.storage
      .from('audiobooks')
      .upload(fileString, values.audio, {
        cacheControl: '3600',
        upsert: true,
      });

    // const publicUrl = supabase.storage
    //   .from('audiobooks')
    //   .getPublicUrl(`${audioUpload.data?.path}`).data.publicUrl;

    const publicUrl = fileString;

    console.log('URL is... ', publicUrl);

    const demoFileExtention = values.demo.name.split('.').pop();

    const demoAudioUpload = await supabase.storage
      .from('demos')
      .upload(
        `demo_audio_${slugify(titleName)}_${time + 1000}.${demoFileExtention}`,
        values.demo,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

    const demoPublicUrl = supabase.storage
      .from('demos')
      .getPublicUrl(`${demoAudioUpload.data?.path}`).data.publicUrl;

    console.log('demo URL is... ', demoPublicUrl);

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
      demo: demoPublicUrl,
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
    const demoPlayer = demoAudioPlayer.current;

    if (audioInput.files) {
      const file = audioInput.files[0];
      if (file) {
        audioInput.id === 'audio'
          ? aPlayer && (aPlayer.src = URL.createObjectURL(file))
          : demoPlayer && (demoPlayer.src = URL.createObjectURL(file));
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
                    ariaLabel='publish-date'
                  />
                </FormControl>
                <FormDescription>editions publish date.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
            aria-label='publish_date'
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
                <FormControl>
                  <Input
                    id='audio'
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
            name='demo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>demo audio file</FormLabel>
                <FormControl>
                  <Input
                    id='demo'
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
                  ref={demoAudioPlayer}
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
  const demoAudioPlayer = useRef<HTMLAudioElement | null>(null);
  const [downloadURL, setDownloadURL] = useState<string>('');

  const router = useRouter();

  const getDownloadURL = async () => {
    const downloadData = await supabase.storage
      .from('audiobooks')
      .createSignedUrl(audiobook.src || '', 600, { download: true });

    if (downloadData.data) {
      setDownloadURL(downloadData.data.signedUrl);
    }
  };

  useEffect(() => {
    getDownloadURL();
  }, []);

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

    const time = Date.now();

    const titleName = await getTitleName(audiobook.title_id);

    let audioPath = null;
    let publicUrl = null;

    const fileNameString = audiobook.src?.split('/').pop() || 'no file';
    let fileExtention = fileNameString.split('.').pop();

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

      fileExtention = fileName.split('.').pop();

      const titleName = await getTitleName(audiobook.title_id);
      console.log('title name is... ', titleName);

      const audioUdate = await supabase.storage
        .from('audiobooks')
        .upload(
          `audio_${slugify(titleName)}_${time}.${fileExtention}`,
          values.audio,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

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
      (publicUrl = `audio_${slugify(titleName)}_${time}.${fileExtention}`);
    // (publicUrl = supabase.storage.from('audiobooks').getPublicUrl(audioPath)
    //   .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    let demoAudioPath = null;
    let demoPublicUrl = null;

    if (values.demo) {
      console.log('current book demo audio ... ', audiobook.demo);

      const demoAudioNameString = audiobook.demo?.split('/') || 'no audio';

      console.log('demo audio Name String ... ', demoAudioNameString);

      console.log('selected demo audio file ... ', values.demo);

      const demoAudioRemove = await supabase.storage
        .from('demos')
        .remove([demoAudioNameString.slice(-1)[0]]);

      demoAudioRemove.error &&
        console.log(
          'demo audio Remove error ... ',
          demoAudioRemove.error.message
        );

      demoAudioRemove.data &&
        console.log('demo audio Remove data... ', demoAudioRemove.data);

      const demoFileName = values.demo.name
        ? values.demo.name
        : 'failNameString';
      console.log('demo audio is...', values.demo);
      console.log('demo audio name is...', values.demo.name);

      const demoFileExtention = demoFileName.split('.').pop();

      const demoTitleName = await getTitleName(audiobook.title_id);
      console.log('title name is... ', demoTitleName);

      const demoAudioUdate = await supabase.storage
        .from('demos')
        .upload(
          `demo_audio_${slugify(demoTitleName)}_${
            time - 1000
          }.${demoFileExtention}`,
          values.demo,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );

      demoAudioUdate.error &&
        console.log(
          'demo audio update error ... ',
          demoAudioUdate.error.message
        );

      demoAudioPath = demoAudioUdate.data?.path;
      console.log('demo audio path ... ', demoAudioPath);
    }

    if (!values.demo) {
      demoAudioPath = audiobook.demo;
      demoPublicUrl = audiobook.demo;
    }

    !demoPublicUrl &&
      demoAudioPath &&
      (demoPublicUrl = supabase.storage
        .from('demos')
        .getPublicUrl(demoAudioPath).data.publicUrl);

    console.log('demo public URL is ...', demoPublicUrl);

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
      demo: demoPublicUrl,
      file_volume: values.audio?.size || audiobook.file_volume,
      duration: values.duration,
    };

    const bookID = await updateAudioData(audiobook.id, audioData);

    router.reload();
  }

  async function onAudioInputChange(event: ChangeEvent<HTMLInputElement>) {
    const audioInput = event.target;
    const aPlayer = audioPlayer.current;
    const demoPlayer = demoAudioPlayer.current;

    if (audioInput.files) {
      const file = audioInput.files[0];
      if (file) {
        audioInput.id === 'audio'
          ? aPlayer && (aPlayer.src = URL.createObjectURL(file))
          : demoPlayer && (demoPlayer.src = URL.createObjectURL(file));
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

                <a href={downloadURL} download target='_blank'>
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
            name='demo'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>demo audio file</FormLabel>

                <p>{audiobook.demo}</p>

                <a href={audiobook.demo!} download target='_blank'>
                  download file
                </a>

                <FormControl>
                  <Input
                    id='demo'
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
                  ref={demoAudioPlayer}
                  controls
                  src={audiobook.demo!}
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

          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog
              deleteFunction={deleteAudioBook}
              itemID={audiobook.id}
            />
          </div>
        </form>
      </Form>
    </div>
  );
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

function PrintedBookForm({ titleID }: { titleID: number }) {
  const photoImage = useRef<HTMLImageElement | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      counter_color: '#ff0000F',
      extra: 'some text',
      is_published: false,
      ISBN: '1-234-54789-0',
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
      sold_out: false,
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
    const time = Date.now();

    const titleName = await getTitleName(titleID);

    const PhotosRowArray = await setPhotoData(
      titleID,
      titleName,
      'PrintBook',
      values.photos
    );
    console.log('photosRowArray is...', PhotosRowArray);

    const coverFileExtention = values.cover.name.split('.').pop();

    const photoUpload = await supabase.storage
      .from('covers')
      .upload(
        `cover_printBook_${slugify(titleName)}_${time}.${coverFileExtention}`,
        values.cover,
        {
          cacheControl: '3600',
          upsert: true,
        }
      );

    const publicUrl = supabase.storage
      .from('covers')
      .getPublicUrl(`${photoUpload.data?.path}`).data.publicUrl;

    const printedData = {
      title_id: titleID,
      counter_color: values.counter_color,
      extra: values.extra,
      is_published: values.is_published,
      ISBN: values.ISBN,
      pages: values.pages,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      sold_out: values.sold_out,
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
            name='sold_out'
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
                  <FormLabel>Нет в наличии</FormLabel>
                </div>
              </FormItem>
            )}
          />

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
            name='extra'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>extra info</FormLabel>
                <FormControl>
                  <Textarea
                    // placeholder='Tell us a little bit about yourself'
                    className='h-full'
                    {...field}
                  />
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
            <div className='block' key={`photosKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`photos.${index}.photo`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>book photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <Input
                        id={`photos.${index}`}
                        type='file'
                        {...fieldProps}
                        onChange={(event) => {
                          onPhotoInputChange(event, `photosImage.${item.id}`);
                          append({ photo: undefined });
                          return onChange(
                            event.target.files && event.target.files[0]
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <img
                      id={`photosImage.${item.id}`}
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
                onClick={() => {
                  console.log('removing inout index ... ', index);
                  remove(index);
                }}
              >
                Delete
              </Button>
            </div>
          ))}

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

const getInitPhotosArray = async (titleID: number, category: CategoryType) => {
  const photosData = await supabase
    .from('Photos')
    .select('*')
    .eq('title_id', titleID)
    .eq('category', category)
    .order('source', { ascending: true });

  photosData && console.log('initial photos data', photosData.data);
  const photosNumber = photosData.data?.length || 1;

  const photosInitArray = [];

  for (let i = 0; i < photosNumber; i++) {
    photosData.data &&
      photosData.data.length &&
      photosData.data[i].source &&
      photosInitArray.push({
        photo: photosData.data[i].source,
      });
  }

  return photosInitArray;
};

const deleteStoredPhotos = async (titleID: number, category: CategoryType) => {
  const photosArray = await getInitPhotosArray(titleID, category);
  let succes = true;

  photosArray.forEach(async (item) => {
    const photoName = item.photo.split('/').pop() || '';
    console.log('file name to delete ...', photoName);

    const deletePhoto = await supabase.storage
      .from('photos')
      .remove([photoName]);

    deletePhoto.error && (succes = false);
  });

  return succes;
};

const deleteDBPhotoLinks = async (titleID: number, category: CategoryType) => {
  const photoLinksDelete = await supabase
    .from('Photos')
    .delete()
    .eq('title_id', titleID)
    .eq('category', category);

  if (photoLinksDelete.error) {
    return false;
  } else {
    return true;
  }
};

const getFileByURL = async (url: string) => {
  const urlFileName = url.split('/').pop() || 'testFileName';
  console.log('url filename ...', urlFileName);

  const file = await fetch(url)
    .then((r) => r.blob())
    .then(
      (blobFile) => new File([blobFile], urlFileName, { type: blobFile.type })
    );
  console.log('url file is ...', file);

  return file;
};

const setPhotoImageSRC = (source: string, index: number) => {
  const imageTag = document.getElementById(
    `photosImage.${index}`
  ) as HTMLImageElement;
  console.log('image element', imageTag);
  imageTag.src = source;
};

function PrintedBookEditForm(book: FullPrintedBookType) {
  const photoImage = useRef<HTMLImageElement | null>(null);
  const effectRan = useRef(false);
  const oldVal = useRef<File | undefined>();

  function setImage(path: string) {
    if (photoImage.current) {
      photoImage.current.src = path;
    }
  }

  const setPhotoInputValue = (file: File, index: number) => {
    const inputTag = document.getElementById(
      `photos.${index}`
    ) as HTMLInputElement;
    console.log('image element', inputTag);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    inputTag.files && (inputTag.files = dataTransfer.files);

    form.setValue(`photos.${index}.photo`, file);
  };

  async function getDataFromReq() {
    const photosInitArray = await getInitPhotosArray(
      book.title_id,
      'PrintBook'
    );

    console.log('new photosInitArray', photosInitArray);

    const photoNumber = photosInitArray.length;

    for (let i = 0; i < photoNumber; i++) {
      const photoFile = await getFileByURL(photosInitArray[i].photo);

      setPhotoInputValue(photoFile, i);

      setPhotoImageSRC(photosInitArray[i].photo, i);
      console.log(`prepending item ${i + 1}`);
      append({ photo: undefined });
    }

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
      data.pages && form.setValue('pages', data.pages),
      data.price && form.setValue('price', data.price));
    // data.sold && form.setValue('sold', data.sold));
  }

  useEffect(() => {
    if (!effectRan.current) {
      getDataFromReq();
    }
    return () => {
      effectRan.current = true;
    };
  }, []);

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      publish_date: book.publish_date ? new Date(book.publish_date) : undefined,
      release_date: book.release_date ? new Date(book.release_date) : undefined,
      shade: 'light',
      counter_color: '#ff2a00',
      photos: [{ photo: undefined }],
      sold_out: book.sold_out !== null && book.sold_out,
      sold: book.sold !== null ? book.sold : 0,
    },
  });

  // Get properties from react hook form
  const {
    control,
    // handleSubmit,
    // formState: { errors },
  } = form;

  // Create dynamic forms
  const { fields, append, prepend, remove } = useFieldArray({
    control,
    name: 'photos',
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    const titleName = await getTitleName(book.title_id);

    if (values.photos) {
      deleteStoredPhotos(book.title_id, 'PrintBook');
      const deleted = await deleteDBPhotoLinks(book.title_id, 'PrintBook');
      console.log('links deleted...', deleted);

      const uploadedPhotos = await setPhotoData(
        book.title_id,
        titleName,
        'PrintBook',
        values.photos
      );
    }

    let imagePath = null;
    let publicUrl = null;

    if (values.cover) {
      console.log('current book cover ... ', book.cover[0].source);

      const imageNameString =
        book.cover[0]?.source?.split('/').pop() || 'no image';

      console.log('image Name String ... ', imageNameString);

      console.log('selected cover file ... ', values.cover);

      const photoRemove = await supabase.storage
        .from('covers')
        .remove([imageNameString]);

      photoRemove.error &&
        console.log('cover Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('cover Remove data... ', photoRemove.data);

      const coverFileExtention = values.cover.name.split('.').pop();

      const photoUdate = await supabase.storage
        .from('covers')
        .upload(
          `cover_printBook_${slugify(titleName)}_${
            time + 321
          }.${coverFileExtention}`,
          values.cover,
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
      pages: values.pages,
      price: values.price,
      discount: values.discount,
      publish_date: values.publish_date?.toISOString(),
      release_date: values.release_date?.toISOString(),
      sold: values.sold,
      sold_out: values.sold_out,
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
            name='sold_out'
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
                  <FormLabel>Нет в наличии</FormLabel>
                </div>
              </FormItem>
            )}
          />

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
                    ariaLabel='publish-date'
                  />
                </FormControl>
                <FormDescription>editions publish date.</FormDescription>
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
                    ariaLabel='release_date'
                  />
                </FormControl>
                <FormDescription>editions release date.</FormDescription>
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
            name='extra'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>extra info</FormLabel>
                <FormControl>
                  <Textarea
                    // placeholder='Tell us a little bit about yourself'
                    className='h-fit'
                    {...field}
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
            <div className='block' key={`photosKey.${item.id}`}>
              <FormField
                control={form.control}
                name={`photos.${index}.photo`}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className='flex flex-col items-start p-1'>
                    <FormLabel>book photo {`${index + 1}`} </FormLabel>
                    <FormControl>
                      <div className='flex flex-row'>
                        <Input
                          id={`photos.${index}`}
                          type='file'
                          {...fieldProps}
                          onFocus={() => {
                            oldVal.current = value;
                            console.log('old value is... ', oldVal.current);
                          }}
                          onChange={(event) => {
                            onPhotoInputChange(event, `photosImage.${index}`);

                            oldVal.current === undefined &&
                              append({ photo: undefined });

                            return onChange(
                              event.target.files && event.target.files[0]
                            );
                          }}
                        />
                        {value && (
                          <Button
                            color='failure'
                            type='button'
                            onClick={() => {
                              console.log('removing inout index ... ', index);
                              remove(index);
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
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
            </div>
          ))}

          <div className='flex flex-row gap-4 justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>

            <DeleteDialog deleteFunction={deletePrintedBook} itemID={book.id} />
          </div>
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
  EBookForm,
  EBookEditForm,
  CardBookForm,
  CardBookEditForm,
};
