import * as Styled from '../Payment/Payment.styled';
import { FormEvent, useEffect, useState } from 'react';
import { promoStore } from '@/store/PromoStore';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

const StyledForm = styled.form`
  position: relative;
`;

const Promocode = observer((): React.ReactElement => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const code = data.get('code') as string;

    promoStore.setCode(code);
    promoStore.codeEntered = true;
  };

  const onFocus = () => {
    promoStore.setRules(true);
  };

  const onBlur = () => {
    promoStore.setRules(false);
    promoStore.rulesShown = true;
  };

  return (
    <StyledForm onSubmit={onSubmit}>
      <Styled.Subtitle>Промокод</Styled.Subtitle>

      <Styled.Input
        name='code'
        placeholder='Введите промокод'
        type='text'
        maxLength={20}
        onFocus={onFocus}
        // onBlur={onBlur}
      />
      <Styled.Button type='submit' onClick={onBlur}>
        Применить
      </Styled.Button>
    </StyledForm>
  );
});

export default Promocode;
