import { useRef, useState } from 'react';

import { supabase } from 'api/supabase-client';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';

async function sendRecoveryEmail(email: string): Promise<boolean> {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `https://mi59173.tw1.ru/changepassword`,
  });

  if (data) {
    console.log('data of sending email ... ', data);
    return true;
  }

  error && console.log('error sending email ... ', error);
  return false;
}

export function RecoveryDialog() {
  const [email, setEmail] = useState<string>();
  const [sent, setSent] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className='space-y-1 w-full'>
      <Dialog>
        <DialogTrigger className='text-mainred underline'>
          востановить пароль
        </DialogTrigger>
        <DialogContent className='dark'>
          <DialogHeader>
            <DialogTitle className='m-auto py-4'>
              восстановление пароля
            </DialogTitle>
            <DialogDescription className='w-full text-center'>
              {sent
                ? 'письмо со ссылкой на восстановление пароля отправлено!'
                : 'Чтобы восстановить свой пароль, введите адрес электронной почты, с которым вы регистрировались на сайте. Письмо со ссылкой на восстановление пароля придёт к вам на электронную почту'}
            </DialogDescription>
          </DialogHeader>

          {!sent && (
            <div className='flex flex-row items-center justify-center gap-4'>
              {/* <Label htmlFor='email' className='text-right'>
                email
              </Label> */}
              <Input
                className='max-w-64'
                ref={inputRef}
                placeholder='email@example.com'
              />
            </div>
          )}

          <DialogFooter>
            {!sent && (
              <Button
                type='button'
                size={'default'}
                className='w-full max-w-48 m-auto'
                // disabled={!inputRef.current?.value}
                onClick={async () => {
                  const email = inputRef.current?.value || '';
                  const recoverySent = await sendRecoveryEmail(email);
                  recoverySent && setSent(true);
                  // recoverySent && router.reload();
                }}
              >
                отправить e-mail
              </Button>
            )}
            {sent && (
              <DialogClose asChild>
                <Button
                  size={'default'}
                  className='w-full max-w-48 m-auto'
                  type='button'
                >
                  Отлично!
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
