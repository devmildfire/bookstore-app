import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { Session } from "@supabase/supabase-js";
import { supabase } from "api/supabase-client";
import DashMain from "@/components/DashBoardPage/DashMain";
import DashNav from "@/components/DashBoardPage/DashNav";
import { LogOut } from "@/components/LoginPage/Logout";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TitleType } from "../titles";


const TitleEditions = () => {

  const [titles, setTitles] = useState<TitleType[]>();

  async function getTitles() {
    const { data, error } = await supabase.from('Titles').select('*');

    data && console.log('Titles data ... ', data);
    error && alert(error);

    data && setTitles(data);
  }

  useEffect(() => {
    getTitles();
  }, []);

  if (!titles) {
    return <div>zero titles found in database</div>;
  }

  return(
    <div className='w-full'>
      <h3> Editions </h3>
      <div>
      <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a Title" />
      </SelectTrigger>
      <SelectContent>

        {titles.map((title) => (
          <SelectItem value={`item-${title.id}`} key={title.id}> {title.name} </SelectItem>
        ))}

      </SelectContent>
    </Select>  
      </div>
    
    </div>
  )
}

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
          <TitleEditions />
          {session && <LogOut session={session} />}
        </div>
      </DashMain>
    );
  }


export default Editions;