import { z } from 'zod';
import styled from 'styled-components';
import React, { FormEvent, useCallback, useState } from 'react';
import useField from '@/hooks/useField';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';

const SubscribeForm = (): React.ReactElement => {
  const [sended, setSended] = useState('');
  const { ...field } = useField();

  // схема для валидации ввода положительного целого числа
  const emailSchema = z.string().email();

  // извлекаем тип положительного целого числа из схемы
  // type Email = z.infer<typeof emailSchema>;

  const onSubmit = useCallback((evt: FormEvent) => {
    evt.preventDefault();

    const inputStuff = evt.target[0].value;
    // console.log(inputStuff);

    const inputValidationObject = emailSchema.safeParse(inputStuff);
    // console.log(inputValidationObject.success);
    // console.log(inputValidationObject.data);

    setSended(inputValidationObject.data);
  }, []);

  return (
    <StyledForm onSubmit={onSubmit}>
      <StyledInput {...field} placeholder='E-mail' />
      <StyledButton disabled={!!sended}>
        {sended === undefined
          ? 'Русский Динозавр может писать только на валидные адреса электронной почты'
          : ''}
        {sended === '' ? 'Подписаться' : ''}
        {!sended ? '' : 'Вы подписаны!'}
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
