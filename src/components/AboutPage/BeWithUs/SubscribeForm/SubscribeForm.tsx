/* eslint-disable import/no-extraneous-dependencies */
import styled, { keyframes } from 'styled-components';
import React, { useRef, useState } from 'react';
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
  const formRef = useRef() as React.MutableRefObject<HTMLFormElement>;
  const inputRef = useRef() as React.MutableRefObject<React.ReactNode>;

  const { control } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const [wipe, setWipe] = useState(false);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const { value } = input;
    const valid = input.validity.valid;
    // не показываем сообщение об ошибке если поле пустое

    if (value !== '') {
      setWipe(false);
      setIsvalid(valid);
      setError(
        'Чтиво может писать только на валидные адреса электронной почты'
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
        ref={formRef}
        // onSubmit={handleSubmit(onSubmit, onError)}
        action={actionString}
        target='_blank'
        method='POST'
        id='styledForm'
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
          type='button'
          onClick={() => {
            const input = document.getElementById(
              'recipient_email'
            ) as HTMLInputElement;

            // const input = inputRef.current;

            const styledForm = formRef.current;

            // setWipe(true);
            console.log('form valid...', isValid);

            if (input.value === '') {
              setWipe(false);
              setError('адрес электронной почты требуется для подписки');
            }

            if (isValid) {
              styledForm.requestSubmit();
            }
          }}
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
      {!isValid && !wipe && error && <ErrorOutput>{error}</ErrorOutput>}
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

  display: flex;
  align-items: center;
  justify-content: center;

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
    /* padding: 0px 0px; */
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
    /* width: 150px; */
    height: 32px;
    /* max-width: var(--width); */
    max-width: 240px;
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }
`;

export default SubscribeForm;
