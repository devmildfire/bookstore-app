'use client';

import { useEffect, useState } from 'react';
import { supabase } from 'api/supabase-client';
// import { Session } from '@supabase/gotrue-js/src/lib/types';
import { Session } from '@supabase/supabase-js';

import { useRouter } from 'next/router';
import { LogOut } from '@/components/LoginPage/Logout';
import { LoginForm } from '@/components/LoginPage/LoginForm';
import PageLayout from '@/layouts/PageLayout';

const Login = (): React.ReactElement => {
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const get_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        data.session && console.log('current session is ... ', data.session);
        data.session &&
          console.log(
            'current user app metadata is ... ',
            data.session.user.app_metadata
          );

        data.session?.user.user_metadata.isAdmin && router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    get_session();
  }, []);

  return (
    <PageLayout>
      <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center'>
        {/* {session ? <LogOut session={session} /> : <LoginForm />} */}

        {session &&
          (session.user.is_anonymous ? (
            <LoginForm />
          ) : (
            <LogOut session={session} />
          ))}

        {!session && <LoginForm />}
      </div>
    </PageLayout>
  );
};

export default Login;
