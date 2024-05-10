import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const authorFormSchema = z.object({
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

  phrase: z.string().min(3, {
    message: 'phrase must be least 3 characters.',
  }),
  nonsalable: z.boolean({ required_error: 'nonsalable condition is required' }),
});

export const authorPhotoSchema = z.object({
  photo: z
    .instanceof(File, { message: 'Image is required.' })
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});

export type AuthorFormFields = z.infer<typeof authorFormSchema>;

export type AuthorPhotoField = z.infer<typeof authorPhotoSchema>;
