/* eslint-disable import/no-extraneous-dependencies */
import styled, { keyframes } from 'styled-components';
import React, { useState } from 'react';
import { z } from 'zod';
import {
  useForm,
  Controller,
  // SubmitHandler,
  // SubmitErrorHandler,
  // ChangeHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import goat from '@/../../src/assets/images/hand_goat.png';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';
import breakPoints from '@/utils/breakPoints';
import debounce from '@/utils/debounce';

const FormSchema = z.object({
  email: z.string().email(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const SubscribeForm = (): React.ReactElement => {
  const [error, setError] = useState('');
  const [isValid, setIsvalid] = useState(false);

  const {
    // handleSubmit,
    control,
    // formState: { errors, isSubmitSuccessful },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const [wipe, setWipe] = useState(false);

  // const onSubmit: SubmitHandler<FormSchemaType> = (data?) => {
  // const onSubmit: SubmitHandler<FormSchemaType> = () => {
  //   console.log(data);
  //   setWipe(false);
  // };

  // const onError: SubmitErrorHandler<FormSchemaType> = () => {
  //   console.log(errors);
  //   setWipe(false);
  // };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const { value } = input;
    const valid = input.validity.valid;
    // не показываем сообщение об ошибке если поле пустое
    if (value !== '') {
      setWipe(false);
      setIsvalid(valid);
      setError(
        'Русский Динозар может писать только на валидные адреса электронной почты'
      );
    }
    if (value === '') {
      setWipe(true);
    }
  };

  const debouncedOnChange = debounce(onChangeInput, 2000);

  const actionString = `https://ru.msndr.net/subscriptions/9fe4710aaeaac030713a32beb9b136d0/form`;

  return (
    <div>
      <StyledForm
        // onSubmit={handleSubmit(onSubmit, onError)}
        action={actionString}
        target='_blank'
        method='POST'
      >
        <Controller
          control={control}
          name='email'
          render={({
            field: {
              // onChange,
              onBlur,
              value,
            },
          }) => (
            <StyledInput
              placeholder='E-mail'
              // onChange={onChange}
              onChange={debouncedOnChange}
              onInvalid={(e) => {
                // отключает системное сообщение валидации
                e.preventDefault();
              }}
              onBlur={onBlur}
              value={value}
              type='email'
              name='recipient[email]'
              id='recipient_email'
              required
              className='form-control'
            />
          )}
        />

        <StyledButton
          type='submit'
          onClick={() => {
            setWipe(true);
          }}
          disabled={!isValid}
        >
          Подписаться
        </StyledButton>

        <div />

        {/* пока мы пользуемся рассылкой через сторонний сервис ru.msndr.net, мы не выдаём сразу подтверждения о подписке */}

        {/* {!wipe && isSubmitSuccessful && !errors.email && (
          <StyledOutput>
            Вы
            <br />
            подписались !
          </StyledOutput>
        )} */}
      </StyledForm>
      {!isValid && !wipe && error && (
        <ErrorOutput>
          {/* Русский Динозар может писать только на валидные адреса электронной
          почты */}
          {error}
        </ErrorOutput>
      )}
    </div>
  );
};

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

{
  /* пока мы пользуемся рассылкой через сторонний сервис ru.msndr.net, мы не выдаём сразу подтверждения о подписке */
}

// interface StyledOutputProps {
//   passed?: number;
// }

// const StyledOutput = styled.div<StyledOutputProps>`
//   animation: ${slideDown} 0.2s linear;
//   top: 0px;
//   background-color: var(--main-white-60);
//   color: var(--main-black);
//   border: none;
//   border-radius: 4px;
//   padding: 60px 20px 20px 20px;
//   max-width: 270px;
//   margin: auto;
//   width: 100%;
//   height: 120px;
//   text-transform: uppercase;
//   text-align: left;
//   background-repeat: no-repeat;
//   background-position: calc(100% - 15px) calc(100% - 2px);
//   background-image: url(${goat.src});

//   @media ${breakPoints.lg} {
//     background-size: 35%;
//     background-position: calc(100% - 15px) calc(100% - 0px);
//     padding: 45px 10px 10px 10px;
//     height: 83px;
//     font-size: 12px;
//     width: 185px;
//   }

//   @media ${breakPoints.smd} {
//     background-size: 28%;
//     background-position: calc(100% - 17px) calc(100% - 0px);
//     padding: 25px 10px 10px 10px;

//     width: 150px;
//     height: 51px;
//     max-width: var(--width);
//     margin: 0 auto;
//     font-size: 8px;
//   }

//   @media ${breakPoints.sm} {
//     width: 150px;
//     max-width: var(--width);
//     margin: 0 auto;
//     font-size: 8px;
//   }
// `;

const ErrorOutput = styled.div`
  background-color: var(--main-red-20);
  color: var(--main-white-100);
  border: none;
  padding: 20px 0;
  margin: 0 auto;
  width: 879px;
  font-size: 16px;
  text-align: center;
  animation: ${slideDown} 0.2s linear;
  max-width: var(--width);
  border-radius: 2px;
  text-align: center;

  @media ${breakPoints.xl} {
    width: 879px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.lg} {
    width: 612px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.smd} {
    width: 400px;
    height: 32px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 32px;
  }

  @media ${breakPoints.sm} {
    width: 285px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 16px;
  }
`;

const StyledInput = styled(Input)`
  background-color: var(--main-white-20);
  border: none;
  color: var(--main-white-100);
  padding: 20px;
  max-width: var(--width);
  margin: 0 auto;
  width: 100%;

  @media ${breakPoints.lg} {
    width: 100%;
    height: 45px;
    max-width: 415px;
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 14px;
  }

  @media ${breakPoints.smd} {
    width: 100%;
    height: 32px;
    max-width: 239px;
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    height: 32px;
    max-width: var(--width);
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }
`;

export default SubscribeForm;
