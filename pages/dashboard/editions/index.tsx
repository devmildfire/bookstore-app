import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { Session } from "@supabase/supabase-js";
import { supabase } from "api/supabase-client";
import DashMain from "@/components/DashBoardPage/DashMain";
import DashNav from "@/components/DashBoardPage/DashNav";
import { LogOut } from "@/components/LoginPage/Logout";


function Editions(): React.ReactElement {
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
      <DashMain>
        <div className='text-center dark flex flex-col justify-center items-center align-middle w-full self-center space-y-16'>
          <DashNav />
          {/* <Titleslist /> */}
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    );
  }


export default Editions;