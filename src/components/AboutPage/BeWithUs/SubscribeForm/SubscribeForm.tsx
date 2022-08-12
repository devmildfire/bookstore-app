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
      <Input {...field} placeholder='E-mail' />
      <StyledButton disabled={sended}>
        {sended ? 'Вы подписаны!' : 'Подписаться'}
      </StyledButton>
    </StyledForm>
  );
};

export default SubscribeForm;
