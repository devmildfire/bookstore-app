// import Hal9000 from '@/assets/images/HAL9000.svg';
import HallIcon from '@/assets/images/HAL9000_iconic_eye.svg';
import HalLogo from '@/assets/images/HALLOGO.svg';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/Common/Text/Text';
import PageLayout from '@/layouts/PageLayout';
import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';
import { supabase } from 'api/supabase-client';
import { useRouter } from 'next/router';

import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const HallDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10vw;

  @media ${breakPoints.lg} {
    padding: 0 5vw;
  }
`;

const HalLogoStyled = styled(HalLogo)`
  width: 100%;
  /* max-width: 404px; */
  max-width: 200px;
  /* padding-bottom: 90px; */
  padding-bottom: 5px;

  @media ${breakPoints.lg} {
    /* padding-bottom: 70px; */
    /* padding-bottom: 10px; */
  }

  @media ${breakPoints.md} {
    /* padding-bottom: 20px; */
    /* padding-bottom: 10px; */
    /* max-width: 204px; */
    max-width: 122px;
  }
`;

const HallIconStyled = styled(HallIcon)`
  width: 100%;
  /* max-width: 550px; */
  max-width: 240px;

  @media ${breakPoints.md} {
    /* max-width: 250px; */
    max-width: 150px;
  }
`;

const Hall = () => {
  const [user, setUser] = useState<User>();
  const router = useRouter();

  const getUser = async (): Promise<User | null> => {
    const { data, error } = await supabase.auth.getUser();

    if (data.user) {
      console.log('user is ... ', user);
      setUser(data.user);
      return data.user;
    }

    return null;
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <PageLayout headTitle='Страница не найдена'>
      <HallDiv>
        {/* <HallIcon as={Hal9000} /> */}
        <HallIconStyled />
        <HalLogoStyled />
        <Text variant='h2_1_HAL' align='center'>
          Молодец, Дэйв,
          {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
        </Text>
        <Text variant='h2_1_HAL' align='center'>
          ты зарегистрировался с e-mail {user && user.email}
          {/* I&apos;m sorry Dave, I&apos;m afraid I can&apos;t do that */}
        </Text>

        <Button
          type='button'
          variant={'outline'}
          size={'default'}
          className='w-full max-w-48'
        >
          Перейти на главную
        </Button>
      </HallDiv>
    </PageLayout>
  );
};

export default Hall;
