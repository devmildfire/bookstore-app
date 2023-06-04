import { z } from 'zod';
import styled, { keyframes } from 'styled-components';
import React, { useState } from 'react';
import {
  useForm,
  // Controller,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';
import breakPoints from '@/utils/breakPoints';

const FormSchema = z.object({
  amount: z.coerce.number(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const DonateForm = (): React.ReactElement => {
  const {
    handleSubmit,
    // control,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const [wipe, setWipe] = useState(false);

  const onSubmit: SubmitHandler<FormSchemaType> = (data?) => {
    console.log(data);
    setWipe(false);
  };

  const onError: SubmitErrorHandler<FormSchemaType> = () => {
    setWipe(false);
  };

  const boostyLink = 'https://boosty.to/russiandino';

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit, onError)}>
      {/* <Controller
        control={control}
        name='amount'
        render={({ field: { onChange, onBlur, value } }) => (
          <StyledInput
            placeholder={'3000 \u20BD'}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      /> */}

      {/* //    кнопка отправляет данные с формы, но пока отправлять некуда
//    она закоментарена и работает только кнопка-ссылка на бусти */}

      {/* <StyledButton
        type='submit'
        onClick={() => {
          setWipe(true);
        }}
        href={boostyLink}
      >
        Задонатить
      </StyledButton> */}

      <StyledButton
        className='boostyBtn'
        type='button'
        href={boostyLink}
        target='_blank'
      >
        Бусти
      </StyledButton>
      {!wipe && errors.amount && (
        <ErrorOutput>
          в щель для задоначивания пролезают только положительные целые числа
        </ErrorOutput>
      )}
    </StyledForm>
  );
};

const StyledInput = styled(Input)`
  background-color: var(--main-white-20);
  border: none;
  color: var(--main-white-100);
  padding: 20px;
  max-width: 640px;
  width: 100%;

  @media ${breakPoints.lg} {
    width: 185px;
    height: 45px;
    padding: 0 10px;
  }

  @media ${breakPoints.smd} {
    width: 150px;
    height: 32px;
    font-size: 12px;
    margin: 0 auto;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    height: 32px;
    font-size: 10px;
    margin: 0 auto;
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  50% {
    transform: translateY(0%);
    opacity: 1;  
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
`;

const ErrorOutput = styled.div`
  background-color: var(--main-red-20);
  color: var(--main-white-100);
  border: none;
  padding: 20px 0;
  margin: 0 auto;
  width: 550px;
  font-size: 16px;
  text-align: center;
  animation: ${slideDown} 0.2s linear;
  max-width: var(--width);
  border-radius: 2px;
  text-align: center;

  @media ${breakPoints.xl} {
    width: 550px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.lg} {
    width: 383px;
    height: 42px;
    line-height: 21px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.smd} {
    width: 312px;
    height: 32px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 16px;
  }

  @media ${breakPoints.sm} {
    width: 285px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 16px;
  }
`;

export default DonateForm;
