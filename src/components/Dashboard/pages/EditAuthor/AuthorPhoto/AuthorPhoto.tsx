import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { observer } from 'mobx-react-lite';
import { AuthorPhotoModel } from '@/store/models/author/AuthorPhotoModel';

type Props = {
  photo: AuthorPhotoModel;
};

const AuthorPhoto: React.FC<Props> = ({ photo }) => {
  return (
    <Card className='overflow-hidden'>
      <CardHeader>
        <CardTitle>Фотография автора</CardTitle>
        <CardDescription>
          Фотография будет отображаться на странице автора и странице его книг.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {photo && photo.src && (
          <div className='grid gap-2'>
            <Image
              alt='Product image'
              className='aspect-square w-full rounded-md object-cover'
              height='300'
              src={photo.file ? URL.createObjectURL(photo.file) : photo.src}
              width='300'
            />
            <label className='flex py-4 w-full items-center justify-center rounded-md border border-dashed cursor-pointer'>
              <Upload className='h-4 w-4 text-muted-foreground pointer-events-none' />
              <span className='ml-2'>Загрузить</span>
              <input
                type='file'
                className='hidden file:text-xl'
                onChange={photo.select}
              />
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default observer(AuthorPhoto);
