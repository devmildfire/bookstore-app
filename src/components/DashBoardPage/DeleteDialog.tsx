import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

interface deleteFn {
  (itemID: number): Promise<boolean>;
}

type DeleteDialogProps = {
  deleteFunction: deleteFn;
  itemID: number;
};

export default function DeleteDialog({
  deleteFunction,
  itemID,
}: DeleteDialogProps) {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger>Удалить</DialogTrigger>
      <DialogContent className='dark'>
        <DialogHeader>
          <DialogTitle className='m-auto'>Вы абсолютно уверены?</DialogTitle>
          <DialogDescription className='w-full text-center'>
            Это действие необратимо. Оно безвозвратно удалит это издание и все
            его файлы из базы данных и хранилища файлов без возможности его
            восстановить.
          </DialogDescription>
        </DialogHeader>
        <Button
          type='button'
          size={'default'}
          className='w-full max-w-48 m-auto'
          onClick={async () => {
            const bookDeleted = await deleteFunction(itemID);
            bookDeleted && router.reload();
          }}
        >
          Удалить
        </Button>
      </DialogContent>
    </Dialog>
  );
}
