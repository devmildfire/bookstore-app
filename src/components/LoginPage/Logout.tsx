import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UserMetadata } from '@supabase/supabase-js';
// import { Session } from '@supabase/gotrue-js/src/lib/types';
import { Session } from '@supabase/supabase-js';

import { supabase } from 'api/supabase-client';
import { Button } from '@/components/ui/button';

export function LogOut({ session }: { session: Session }) {
  const router = useRouter();
  const [appData, setAppData] = useState<UserMetadata>();

  async function userGet() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setAppData(user?.app_metadata);
  }

  // async function userSet() {
  //   const { data, error } = await supabase.auth.updateUser({
  //     data: { isAdmin: true },
  //   });

  //   data && console.log('metadata update success!');
  //   error && console.log('metadata update failed!');
  // }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { error } = await supabase.auth.signOut();

    console.log('Logging out ...  ', error);

    router.reload();
  }

  useEffect(() => {
    // userSet();
    userGet();
  }, []);

  // useEffect(() => {
  //   metaData?.isAdmin && router.push('/dashboard');
  // }, [metaData, router]);

  return (
    <div className='space-y-1 w-full'>
      <div>
        currently logged in as{' '}
        {session.user.is_anonymous ? 'anonymous user' : session.user.email}
      </div>

      {/* {checkAdmin(session.user.id) && ( */}
      {appData?.claims_admin && (
        <div>you have admin access and can do stuff</div>
      )}

      <form onSubmit={handleSubmit}>
        <Button
          type='submit'
          variant={'outline'}
          size={'default'}
          className='w-full max-w-48'
        >
          Log Out
        </Button>
      </form>
    </div>
  );
}
