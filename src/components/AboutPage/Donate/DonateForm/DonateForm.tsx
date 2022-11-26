import { z } from 'zod';
import styled from 'styled-components';
import React, { FormEvent, useCallback, useState } from 'react';
import useField from '@/hooks/useField';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';

const DonateForm = (): React.ReactElement => {
  const [donated, setDonated] = useState(0);
  const { ...field } = useField();

  // схема для валидации ввода положительного целого числа
  const numberSchema = z.number().positive().int();

  const onSubmit = useCallback((evt: FormEvent) => {
    evt.preventDefault();

    const form = evt.target as HTMLFormElement;
    const input = form[0] as HTMLInputElement;
    const inputStuff = +input.value;

    const result = numberSchema.safeParse(inputStuff);
    // console.log('safeParse result = ', result);
    if (!result.success) {
      // handle error then return
      setDonated(-1);
      // result.error;
    } else {
      // do something
      setDonated(1);
      // result.data;
    }
  }, []);

  return (
    <StyledForm onSubmit={onSubmit}>
      <StyledInput
        name='donationAmount'
        {...field}
        placeholder={'3000 \u20BD'}
      />
      <StyledButton disabled={donated > 0}>
        {donated === -1
          ? 'в щель для задоначивания пролезают только положительные целые числа'
          : ''}
        {donated === 0 ? 'Задонатить' : ''}
        {donated === 1 ? 'Вы задонатили Чтиву!' : ''}
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

export default DonateForm;
