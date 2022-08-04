/* eslint-disable no-nested-ternary */
import * as React from 'react';
import useEvent from '@/hooks/useEvent';
import {
  Handler,
  OnChangeValue,
  Option,
  SelectValue,
  Value,
} from '../../types';
import Context, { OptionsContextOptions } from './context';

export interface OptionsProviderProps<
  T extends SelectValue,
  IsMulti extends boolean
> {
  readonly onChange: OnChangeValue<T, IsMulti>;
  readonly isMulti: IsMulti;
  readonly options: Option<T>[];
  readonly value: Value<T, IsMulti>;
}

const OptionsProvider = <T extends SelectValue, IsMulti extends boolean>(
  props: React.PropsWithChildren<OptionsProviderProps<T, IsMulti>>,
): React.ReactElement => {
  const {
    children, onChange, isMulti, options, value,
  } = props;

  const initialValue: Option<SelectValue>[] = value
    ? Array.isArray(value)
      ? value
      : [value]
    : [];
  const [selectedValue, setSelectedValue] = React.useState(initialValue);

  React.useLayoutEffect(() => {
    setSelectedValue(Array.isArray(value) ? value : value ? [value] : []);
  }, [value]);

  /* Посмотреть что будет производительнее, useEvent или useCallback */
  const addValue: Handler<SelectValue> = useEvent((addingValue) => {
    const newState = isMulti
      ? [...(value as Value<T, true>), addingValue]
      : [addingValue];
    onChange((isMulti ? newState : newState[0] || null) as any);
  });

  const deleteValue: Handler<SelectValue> = useEvent((deletingValue) => {
    const newState = selectedValue.filter((option) => option !== deletingValue);
    onChange((isMulti ? newState : newState[0] || null) as any);
  });

  const provideValue: OptionsContextOptions<IsMulti> = {
    /* Чтобы сохранить контролируемость снаружи */
    selectedValue: value ? initialValue : selectedValue,
    isMulti,
    addValue,
    deleteValue,
    options,
  };

  return <Context.Provider value={provideValue}>{children}</Context.Provider>;
};

export default OptionsProvider;
