import styled from 'styled-components';
import React, { FormEvent, useCallback, useState } from 'react';
import useField from '@/hooks/useField';
import Input from '@/components/Common/Input';
import { StyledButton, StyledForm } from './styles';

const SubscribeForm = (): React.ReactElement => {
  const [sended, setSended] = useState(false);
  const { ...field } = useField();

  const onSubmit = useCallback((evt: FormEvent) => {
    evt.preventDefault();
    setSended(true);
  }, []);

  return (
    <StyledForm onSubmit={onSubmit}>
      <StyledInput {...field} placeholder='E-mail' />
      <StyledButton disabled={sended}>
        {sended ? 'Вы подписаны!' : 'Подписаться'}
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
