/* eslint-disable no-nested-ternary */
import * as React from 'react';
import useEvent from '@/hooks/useEvent';
import {
  Handler,
  OnChangeValue,
  Option,
  SelectValue,
  Value
} from '../../types';
import {
  ValuesOptions,
  valuesContext,
  valuesHandlersContext,
  ValuesHandlersOptions
} from './context';
import hasValue from '../../utils/hasValue';

export interface ValuesProviderProps<
  T extends SelectValue,
  IsMulti extends boolean
> {
  readonly onChange: OnChangeValue<T, IsMulti>;
  readonly isMulti: IsMulti;
  readonly options: Option<T>[];
  readonly value: Value<T, IsMulti>;
}

const defaultValue: Option<SelectValue> = {
  label: 'Empty',
  value: 'Empty',
  disabled: true,
};

const ValuesContextProvider = <T extends SelectValue, IsMulti extends boolean>(
  props: React.PropsWithChildren<ValuesProviderProps<T, IsMulti>>
): React.ReactElement => {
  const { children, onChange, isMulti, options, value, } = props;
  const hasAnyValue = hasValue(value);
  const initialValue = hasAnyValue
    ? Array.isArray(value)
      ? value
      : [value]
    : [];
  const [selectedValue, setSelectedValue] = React.useState(initialValue);

  React.useEffect(() => {
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

  const provideValue: ValuesOptions<IsMulti> = {
    /* Чтобы сохранить контролируемость снаружи */
    selectedValue: value ? initialValue : (selectedValue as any),
    isMulti,
    values: options.length ? options : [defaultValue],
    hasValue: hasAnyValue,
  };

  const provideHandlers: ValuesHandlersOptions = {
    addValue,
    deleteValue,
  };

  return (
    <valuesContext.Provider value={provideValue}>
      <valuesHandlersContext.Provider value={provideHandlers}>
        {children}
      </valuesHandlersContext.Provider>
    </valuesContext.Provider>
  );
};

export default ValuesContextProvider;
