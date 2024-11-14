'use client';

import Button from '@/components/Common/Button';
import { Text } from '@/components/Common/Text/Text';
import breakPoints from '@/utils/breakPoints';
import styled from 'styled-components';
import { LinkReturnType } from './api/order';
import { postData } from '@/utils/postData';
import { useEffect, useState } from 'react';

import Checkmark from '@/assets/images/checkmark.svg';
import PageLayout from '@/layouts/PageLayout';
import RedLink from '@/components/Common/Link/RedLink';

import { GetServerSideProps } from 'next/types';
import { type GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';

const domainURL = process.env.NEXT_PUBLIC_DOMAIN_URL;

type propsType = { [key: string]: string };

type chekObjType = {
  isValid: boolean;
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const checkOrder = async (
    invID: string,
    outSum: string,
    signatureValue: string
  ): Promise<boolean> => {
    const checkOrderObj: chekObjType = await postData(
      `${domainURL}/api/order`,
      {
        oper: 'checkOrder',
        orderID: invID,
        outSum: outSum,
        signatureValue: signatureValue,
      }
    );
    return checkOrderObj.isValid;
  };

  const req = context.req;
  console.log('req is ...', req);


  const method = req.method;
  console.log('method is ...', req.method);

  if (method === 'GET') {
    const oneObject = { valid: 'invalid' };
    return { props: { oneObject } };
  }

  const read = req.read();

  const dataString = read.toString();
  console.log('dataString is ...', dataString);


  const dataItems = dataString.split('&');
  console.log('dataItems are ...', dataItems);


  const dataObjects: Record<string, string>[] = dataItems.map(
    (item: string) => {
      const keyValue = item.split('=');
      const key = keyValue[0];
      const value = keyValue[1];
      const obj: Record<string, string> = {};
      obj[key] = value;
      return obj;
    }
  );

  console.log('dataObjects are ...', dataObjects);


  let oneObject: propsType = {};
  dataObjects.forEach((object) => {
    oneObject = { ...oneObject, ...object };
  });

  console.log('oneObject is ...', oneObject);


  const invID = oneObject.InvId;
  const outSum = oneObject.OutSum;
  const signatureValue = oneObject.SignatureValue;

  const orderIsValid = await checkOrder(invID, outSum, signatureValue);

  if (orderIsValid) {
    oneObject = { ...oneObject, valid: 'valid' };
  } else {
    oneObject = { valid: 'invalid' };
  }

  return { props: { oneObject } };
};

const SuccessDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  padding: 100px calc((100vw - 1440px) / 2);

  @media ${breakPoints.xxl} {
    padding: 100px 10vw 0;
  }

  @media ${breakPoints.lg} {
    padding: 80px 5vw;
  }

  @media ${breakPoints.sm} {
    align-items: center;
    padding: 50px 5vw;

    h3,
    p {
      text-align: center;
    }
  }
`;

const StyledCheckMark = styled(Checkmark)`
  @media ${breakPoints.sm} {
    order: -1;
  }
`;

const CheckDiv = styled.div`
  display: flex;
  flex-direction: row;

  align-items: center;
  gap: clamp(10px, 1.25vw + 9.6px, 30px);

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.sm} {
    flex-direction: column;
  }
`;

const StyledButton = styled(Button)`
  padding-top: 5px;

  @media ${breakPoints.md} {
    > button {
      max-width: 217px;
      min-width: 217px;

      > p {
        font-size: 10px;
      }
    }
  }
`;

const Success = ({
  oneObject,
}: {
  oneObject: propsType;
}): React.ReactElement => {
  const router = useRouter();

  const [itemsLinks, setItemsLinks] = useState<LinkReturnType[]>();
  const [retries, setRetries] = useState(0);

  const getFile = async (url: string, fileName: string) => {
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        const alink = document.createElement('a');
        alink.href = fileUrl;
        alink.download = fileName;
        alink.click();
      });
    });
  };

  const isInvalid = oneObject.valid === 'invalid';

  const invID = oneObject.InvId;

  useEffect(() => {
    invID && getAllLinks(invID);
  }, [invID, retries]);

  if (isInvalid) {
    router.push('/404');
    return <div></div>;
  }

  const getAllLinks = async (orderID: string) => {
    console.log('fetching links ...');

    const allLinks: LinkReturnType[] = await postData(`/api/order`, {
      oper: 'fetchAllLinks',
      orderID: orderID,
    });

    allLinks.length &&
      (console.log('allLinks ', allLinks),
      allLinks.forEach((link) => {
        console.log(`downloading ... ${link.name} `);
        const fileName = link.name;

        getFile(link.url, fileName!);

        setItemsLinks(allLinks);
      }),
      console.log('all links gotten are ... ', allLinks));

    !allLinks.length &&
      (console.log('NONE links gotten... retrying'), setRetries(retries + 1));
  };

  return (
    <PageLayout>
      <SuccessDiv>
        <div className='flex flex-col gap-5'>
          <CheckDiv>
            <Text variant='h2c' style={{ paddingBottom: '0px' }}>
              Успех!
            </Text>
            <StyledCheckMark />
          </CheckDiv>
          <Text variant='h3_1Bel'>
            Мы свяжемся с Вами для отправки материального издания.
          </Text>
          <div>
            <Text variant='h3c'>
              Скачивание цифрового, аудио издания или курса должно начаться
              автоматически.
            </Text>
            <Text variant='h3c'>
              Если не началось, то нажмите сюда:
              {itemsLinks?.length &&
                itemsLinks.map((link, index) => {
                  return (
                    <div key={link.name + index.toString()}>
                      <RedLink href={link.url}>{link.name}</RedLink>
                    </div>
                  );
                })}
            </Text>
          </div>
        </div>
        <div className='flex flex-col gap-4 items-center sm:items-start'>
          <Text variant='ctext'>
            Спасибо за покупку. Вернитесь на главную страницу или воспользуйтесь
            поиском, чтобы выбрать что-то ещё
          </Text>
          <StyledButton className='backButton' href='/' variant='wide'>
            Перейти на главную
          </StyledButton>
        </div>
      </SuccessDiv>
    </PageLayout>
  );
};

export default Success;
