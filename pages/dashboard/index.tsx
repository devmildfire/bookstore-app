import { LogOut } from '@/components/Login/Logout';
import { Session } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Dashboard = (): React.ReactElement => {
  const [session, setSession] = useState<Session>();
  const router = useRouter();

  const check_session = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(error);
      } else {
        data.session && setSession(data.session);
        !data.session?.user.user_metadata.isAdmin && router.push('/login');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    check_session();
  });

  return (
    <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center'>
      {session && <LogOut session={session} />}
    </div>
  );
};

export default Dashboard;
