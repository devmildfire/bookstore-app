import { z } from 'zod';
// import goat from '@/../../public/images/hand_goat.png';
import styled, { keyframes } from 'styled-components';
// import React, { FormEvent, useCallback, useState } from 'react';
import React, { FormEvent, useState } from 'react';
import useField from '@/hooks/useField';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';
import breakPoints from '@/utils/breakPoints';

const SubscribeForm = (): React.ReactElement => {
  const [sended, setSended] = useState(0);
  const { ...field } = useField();

  // схема для валидации ввода положительного целого числа
  const emailSchema = z.string().email();

  // const onSubmit = useCallback((evt: FormEvent) => {
  //   evt.preventDefault();

  //   const form = evt.target as HTMLFormElement;
  //   const input = form[0] as HTMLInputElement;
  //   const inputStuff = input.value;

  //   const result = emailSchema.safeParse(inputStuff);
  //   // console.log('safeParse result = ', result);
  //   if (!result.success) {
  //     // handle error then return
  //     setSended(-1);
  //     // result.error;
  //   } else {
  //     // do something
  //     setSended(1);
  //     // result.data;
  //   }
  // }, []);

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();

    const form = evt.target as HTMLFormElement;
    const input = form[0] as HTMLInputElement;
    const inputStuff = input.value;

    const result = emailSchema.safeParse(inputStuff);
    // console.log('safeParse result = ', result);
    if (!result.success) {
      // handle error then return
      setSended(-1);
      // result.error;
    } else {
      // do something
      setSended(1);
      // result.data;
    }
  };

  return (
    <div>
      <StyledForm onSubmit={onSubmit}>
        <StyledInput {...field} placeholder='E-mail' />
        <StyledButton onClick={() => setSended(0)}>Подписаться</StyledButton>
        <div />
        {/* {sended === -1 && (
          <StyledOutput>Вы не подписаны !</StyledOutput>
        )} */}
        {/* {sended === 0 && <StyledOutput>Вы подписаны !</StyledOutput>} */}
        {/* {sended === 1 && <StyledOutput hidden> - </StyledOutput>} */}

        {/* {sended === 0 ? 'Подписаться' : ''}
      {sended === 1 ? 'Вы подписаны!' : ''} */}

        {sended === 1 && <StyledOutput>Вы подписаны !</StyledOutput>}
      </StyledForm>
      {sended === -1 && (
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
  /* opacity: 1; */
  /* transform: translateY(100px); */
  /* transition: all 3s ease; */

  @media ${breakPoints.sm} {
    width: 150px;
    max-width: var(--width);
    padding: 6px;
    margin: 0 auto;
    font-size: 14px;
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
  width: 100%;
  text-align: center;
  animation: ${slideDown} 3s linear;
  max-width: var(--width);
  border-radius: 2px;

  @media ${breakPoints.sm} {
    width: 285px;
    margin: 0 auto;
    font-size: 8px;
    padding: 6px 0;
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

  @media ${breakPoints.sm} {
    width: 150px;
    max-width: var(--width);
    padding: 6px;
    margin: 0 auto;
    font-size: 14px;
  }
`;

export default SubscribeForm;
