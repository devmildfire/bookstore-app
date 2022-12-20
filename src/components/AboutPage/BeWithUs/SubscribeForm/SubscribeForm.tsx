import { z } from 'zod';
// import goat from '@/../../public/images/hand_goat.png';
import styled, { keyframes } from 'styled-components';
// import React, { FormEvent, useCallback, useState } from 'react';
import React, { useState } from 'react';
import {
  useForm,
  Controller,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import useField from '@/hooks/useField';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';
import breakPoints from '@/utils/breakPoints';

const FormSchema = z.object({
  email: z.string().email(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const SubscribeForm = (): React.ReactElement => {
  const {
    // register,
    // watch,
    handleSubmit,
    control,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });

  const [wipe, setWipe] = useState(false);

  // const onSubmit: SubmitHandler<FormSchemaType> = (data?) => {
  const onSubmit: SubmitHandler<FormSchemaType> = () => {
    // console.log(data);
    setWipe(false);
  };

  const onError: SubmitErrorHandler<FormSchemaType> = () => {
    // console.log(errors);
    setWipe(false);
  };

  return (
    <div>
      <StyledForm onSubmit={handleSubmit(onSubmit, onError)}>
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              placeholder='E-mail'
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />

        <StyledButton
          type='submit'
          onClick={() => {
            setWipe(true);
          }}
        >
          Подписаться
        </StyledButton>

        <div />

        {!wipe && isSubmitSuccessful && !errors.email && (
          <StyledOutput>
            Вы
            <br />
            подписаны !
          </StyledOutput>
        )}
      </StyledForm>
      {!wipe && errors.email && (
        <ErrorOutput>
          Русский Динозар может писать только на валидные адреса электронной
          почты
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

interface StyledOutputProps {
  passed?: number;
}

const StyledOutput = styled.div<StyledOutputProps>`
  /* display: ${(props) => (props.hidden ? 'none' : 'block')}; */
  /* position: absolute; */
  animation: ${slideDown} 3s linear;
  /* opacity: ${(props) => (props.passed === 1 ? '0' : '1')}; */
  top: 0px;
  background-color: var(--main-white-20);
  color: var(--main-black);
  border: none;
  border-radius: 4px;
  padding: 20px;
  max-width: 300px;
  margin-left: auto;
  /* max-width: var(--width); */
  width: 100%;
  text-transform: uppercase;
  /* opacity: 1; */
  /* transform: translateY(100px); */
  /* transition: all 3s ease; */

  @media ${breakPoints.smd} {
    width: 150px;
    height: 51px;
    max-width: var(--width);
    padding: 6px;
    margin: 0 auto;
    font-size: 8px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    max-width: var(--width);
    padding: 6px;
    margin: 0 auto;
    font-size: 8px;
  }
`;

const ErrorOutput = styled.div`
  background-color: var(--main-red-20);
  color: var(--main-white-100);
  border: none;
  padding: 20px 0;
  /* max-width: 300px; */
  margin: 0 auto;
  /* max-width: var(--width); */
  width: 879px;
  font-size: 16px;
  text-align: center;
  animation: ${slideDown} 3s linear;
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
