import { z } from 'zod';
import styled from 'styled-components';
import React, { FormEvent, useCallback, useState } from 'react';
import useField from '@/hooks/useField';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';

const SubscribeForm = (): React.ReactElement => {
  const [sended, setSended] = useState(0);
  const { ...field } = useField();

  // схема для валидации ввода положительного целого числа
  const emailSchema = z.string().email();

  // извлекаем тип положительного целого числа из схемы
  // type Email = z.infer<typeof emailSchema>;

  const onSubmit = useCallback((evt: FormEvent) => {
    evt.preventDefault();
    // const data = new FormData(evt.target);

    const inputStuff = (evt.target as HTMLInputElement).value;
    // console.log(inputStuff);

    // const inputValidationObject = emailSchema.safeParse(inputStuff);
    // console.log(inputValidationObject.success);
    // console.log(inputValidationObject.data);

    // const dataValue = inputValidationObject.data?.value;

    const result = emailSchema.safeParse(inputStuff);
    if (!result.success) {
      // handle error then return
      setSended(-1);
      // result.error;
    } else {
      // do something
      setSended(1);
      // result.data;
    }

    // setSended(inputValidationObject.data);
  }, []);

  return (
    <StyledForm onSubmit={onSubmit}>
      <StyledInput {...field} placeholder='E-mail' />
      <StyledButton disabled={!!sended}>
        {sended === -1
          ? 'Русский Динозавр может писать только на валидные адреса электронной почты'
          : ''}
        {sended === 0 ? 'Подписаться' : ''}
        {sended === 1 ? '' : 'Вы подписаны!'}
      </StyledButton>
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
`;

export default SubscribeForm;
