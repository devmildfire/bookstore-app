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
import { allEnums } from '@/utils/allEnums';
import { category } from '@/utils/EnumStrings/category';
import { titlesStore } from '@/store/locals/dashboard/TitlesStore/TitlesStore';
import { BookProductType, BoxSetType } from 'pages/dashboard/boxsets';
import { Database } from 'api/books/types';
import DeleteDialog from './DeleteDialog';

const MAX_FILE_SIZE = 5 * 1024 * 1024; //  5MB
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; //  5MB

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

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

export const zCategoryType = z.enum(category);

// const productFullSchema = z.object({
//   type: zCategoryType.optional(),
//   title_id: z.number().int().positive().optional(),
// });

const productSchema = z.object({
  productNumber: z.number().int().optional(),
});

const productSetSchema = z.array(productSchema);

type ProductArrayType = z.infer<typeof productSetSchema>;
type ProductInsertType =
  Database['public']['Tables']['BoxSets_Books']['Insert'];

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Box Set name must be at least 3 characters long.',
  }),
  description: z.string().min(6, {
    message: 'Box Set description must be at least 6 characters long.',
  }),
  picture: imageSchema,
  price: z.number().int().positive(),
  discount: z.number().int().min(0).max(100).default(0),
  products: productSetSchema,
});

const formEditSchema = z.object({
  description: z.string().min(6, {
    message: 'Box Set description must be at least 6 characters long.',
  }),
  picture: imageOptionalSchema,
  price: z.number().int().positive(),
  discount: z.number().int().min(0).max(100).default(0),
  products: productSetSchema,
});

type boxSetFormProps = {
  products: BookProductType[];
};

type boxSetEfitFormProps = {
  products: BookProductType[];
  boxSet: BoxSetType;
};

const setProductsData = async (
  boxSetID: number,
  prods: ProductArrayType,
  products: BookProductType[]
) => {
  if (prods.length > 0) {
    console.log('products to add are ... ', prods);

    const productsValues: ProductInsertType[] = [];

    prods.forEach((prod) => {
      if (prod.productNumber === undefined) return;

      const prodIndex = prod.productNumber;

      const prodType = products[prodIndex].type;
      const prodTitleID = products[prodIndex].title_id;

      productsValues.push({
        box_set: boxSetID,
        category: prodType,
        title_id: prodTitleID,
      });
    });

    const productsData = await supabase
      .from('BoxSets_Books')
      .insert(productsValues)
      .select('*');

    console.log('products data is ... ', productsData);

    productsData.error && window.alert(productsData.error.message);

    productsData.data &&
      window.alert(
        `Товары бокс сета ${productsData.data[0].box_set} успешно добавлены`
      );
  }
};

const deleteStoredProducts = async (boxSetID: number) => {
  let succes = true;

  const deleteData = await supabase
    .from('BoxSets_Books')
    .delete()
    .eq('box_set', boxSetID);

  deleteData.error && (succes = false);

  return succes;
};

function BoxSetForm({ products }: boxSetFormProps) {
  const photoImage = useRef<HTMLImageElement | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      picture: undefined,
      price: undefined,
      description: '',
      discount: 0,
      products: [
        {
          productNumber: undefined,
        },
      ],
    },
  });

  // Get properties from react hook form
  const {
    control,
    // handleSubmit,
  } = form;

  // Create dynamic forms
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    const pictureUpload = await supabase.storage
      .from('boxsets')
      .upload(`boxset_${slugify(values.name)}`, values.picture, {
        cacheControl: '3600',
        upsert: true,
      });

    const publicUrl = supabase.storage
      .from('boxsets')
      .getPublicUrl(`${pictureUpload.data?.path}`).data.publicUrl;

    const { data, error } = await supabase
      .from('BoxSets')
      .insert({
        name: values.name,
        picture: publicUrl,
        description: values.description,
        price: values.price,
        discount: values.discount,
      })
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`${data.name} успешно добавлен к бокс сетам`);

    if (data) {
      const uploadProducts = await setProductsData(
        data.id,
        values.products,
        products
      );
    }

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
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4 w-full'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Box Set Name</FormLabel>
                <FormControl>
                  <Input placeholder='somebody' {...field} />
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
                <FormLabel>Box Set Description</FormLabel>
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
            name='picture'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Box Set Picture</FormLabel>
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
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Price</FormLabel>
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

          <div className='flex flex-col gap-4'>
            Box Set Products
            {fields.map((item, index) => {
              // console.log('fields are ... ', fields);

              return (
                <div
                  className='flex flex-row gap-4 items-end'
                  key={`productsKey.${item.id}`}
                >
                  <FormField
                    control={form.control}
                    name={`products.${index}.productNumber`}
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className='min-w-36 grow'>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            onChange(+value);
                          }}
                          defaultValue={value?.toString() || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select title' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product, prodIndex) => (
                              <SelectItem
                                key={
                                  product.title_name +
                                  prodIndex +
                                  product.type +
                                  index
                                }
                                value={prodIndex.toString()}
                              >
                                {product.title_name} - {product.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>
              );
            })}
            <Button
              type='button'
              size={'default'}
              className='w-full max-w-48'
              onClick={() => {
                append({
                  productNumber: undefined,
                });
              }}
            >
              Добавить продукт
            </Button>
          </div>
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

function BoxSetEditForm({ products, boxSet }: boxSetEfitFormProps) {
  const [newPicture, setNewPicture] = useState<string>();
  const effectRan = useRef(false);

  const photoImage = useRef<HTMLImageElement | null>(null);

  async function getDataFromReq() {
    const { data } = await supabase
      .from('BoxSets')
      .select('*')
      .eq('id', boxSet.id)
      .single();

    data && console.log('data from req is...', data);

    data &&
      (data.picture && setNewPicture(data.picture),
      data.description && form.setValue('description', data.description),
      data.price !== null && form.setValue('price', data.price),
      data.discount !== null && form.setValue('discount', data.discount));

    const productsData = await supabase
      .from('BoxSets_Books')
      // .select('*, BoxSets(name)')
      .select('*')
      .eq('box_set', boxSet.id);

    if (productsData.data) {
      console.log('products data from reference table... ', productsData.data);

      const productsArray: ProductArrayType = productsData.data.map(
        (boxSetItem) => {
          const filteredProducts = products.filter(
            (product) =>
              boxSetItem.title_id === product.title_id &&
              boxSetItem.category === product.type
          );

          const prodNumber = products.indexOf(filteredProducts[0]);

          return {
            productNumber: prodNumber,
          };
        }
      );

      form.setValue('products', productsArray);
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

  const router = useRouter();

  const form = useForm<z.infer<typeof formEditSchema>>({
    resolver: zodResolver(formEditSchema),
    defaultValues: {
      // bio: author.bio ? author.bio : undefined,
      // birthDate: author.birth_date ? new Date(author.birth_date) : undefined,
      // deathDate: author.death_date ? new Date(author.death_date) : undefined,
      // city: author.city ? author.city : undefined,
      // phrase: author.phrase ? author.phrase : undefined,
      // nonsalable: author.nonsalable,
      // contacts: [],
    },
  });

  // Get properties from react hook form
  const {
    control,
    // handleSubmit,
  } = form;

  // Create dynamic forms
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  async function onEditSubmit(values: z.infer<typeof formEditSchema>) {
    console.log('values ... ', values);
    const time = Date.now();

    deleteStoredProducts(boxSet.id);

    const uploadProducts = await setProductsData(
      boxSet.id,
      values.products,
      products
    );

    let imagePath = null;
    let publicUrl = null;

    if (boxSet.picture && values.picture) {
      console.log('current boxSet picture ... ', boxSet.picture);

      const imageNameString = boxSet.picture.split('/');

      const fileExtention = values.picture.name.split('.').pop();

      console.log('image Name String ... ', imageNameString);

      console.log('selected photo file ... ', values.picture);

      const photoRemove = await supabase.storage
        .from('boxsets')
        .remove([imageNameString.slice(-1)[0]]);

      photoRemove.error &&
        console.log('photo Remove error ... ', photoRemove.error.message);

      photoRemove.data &&
        console.log('photo Remove data... ', photoRemove.data);

      const photoUdate = await supabase.storage
        .from('boxsets')
        .upload(
          `boxset_${slugify(boxSet.name!)}_${time}.${fileExtention}`,
          values.picture,
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

    if (!boxSet.picture && values.picture) {
      const fileExtention = values.picture.name.split('.').pop();

      const photoUpload = await supabase.storage
        .from('boxsets')
        .upload(
          `boxset_${slugify(boxSet.name!)}_${time}.${fileExtention}`,
          values.picture,
          {
            cacheControl: '3600',
            upsert: true,
          }
        );
      imagePath = photoUpload.data?.path;
    }

    if (boxSet.picture && !values.picture) {
      imagePath = boxSet.picture;
      publicUrl = boxSet.picture;
    }

    !publicUrl &&
      imagePath &&
      (publicUrl = supabase.storage.from('boxsets').getPublicUrl(imagePath)
        .data.publicUrl);

    console.log('public URL is ...', publicUrl);

    const { data, error } = await supabase
      .from('BoxSets')
      .update({
        picture: publicUrl || '',
        description: values.description,
        price: values.price,
        discount: values.discount,
      })
      .eq('id', boxSet.id)
      .select('*')
      .single();

    error && window.alert(error.message);
    data && window.alert(`бокс сет ${data.name} успешно обновлён`);
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
            name='description'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Box Set Description</FormLabel>
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
            name='picture'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Box Set Picture</FormLabel>
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
                  src={boxSet.picture || ''}
                  alt='photo image'
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start p-1'>
                <FormLabel>Price</FormLabel>
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

          <div className='flex flex-col gap-4'>
            Box Set Products
            {fields.map((item, index) => {
              // console.log('fields are ... ', fields);

              return (
                <div
                  className='flex flex-row gap-4 items-end'
                  key={`productsKey.${item.id}`}
                >
                  <FormField
                    control={form.control}
                    name={`products.${index}.productNumber`}
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem className='min-w-36 grow'>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            onChange(+value);
                          }}
                          defaultValue={value?.toString() || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select title' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product, prodIndex) => (
                              <SelectItem
                                key={
                                  product.title_name +
                                  prodIndex +
                                  product.type +
                                  index
                                }
                                value={prodIndex.toString()}
                              >
                                {product.title_name} - {product.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>
              );
            })}
            <Button
              type='button'
              size={'default'}
              className='w-full max-w-48'
              onClick={() => {
                append({
                  productNumber: undefined,
                });
              }}
            >
              Добавить продукт
            </Button>
          </div>
          <div className='flex flex-row justify-between'>
            <Button
              type='submit'
              variant={'outline'}
              size={'default'}
              className='w-full max-w-48'
            >
              Обновить
            </Button>
            <DeleteDialog deleteFunction={deleteBoxSet} itemID={boxSet.id} />
          </div>
        </form>
      </Form>
    </div>
  );
}

const getBoxSetByID = async (boxSetID: number) => {
  const boxSet = await supabase
    .from('BoxSets')
    .select('*')
    .eq('id', boxSetID)
    .single();

  return boxSet.data ? boxSet.data : null;
};

const deleteBoxSet = async (boxSetID: number) => {
  const boxSet = await getBoxSetByID(boxSetID);

  if (boxSet) {
    const imageNameString = boxSet.picture.split('/');

    console.log('image Name String ... ', imageNameString);

    const photoRemove = await supabase.storage
      .from('boxsets')
      .remove([imageNameString.slice(-1)[0]]);

    photoRemove.error &&
      console.log('photo Remove error ... ', photoRemove.error.message);

    photoRemove.data && console.log('photo Remove data... ', photoRemove.data);
  }

  const { error } = await supabase.from('BoxSets').delete().eq('id', boxSetID);

  error && window.alert(error.message);
  !error && window.alert(`Бокс сет номер ${boxSetID} успешно удалён`);

  return !error ? true : false;
};

export { BoxSetForm, BoxSetEditForm };
