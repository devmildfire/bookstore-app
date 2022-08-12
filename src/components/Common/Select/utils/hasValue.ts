import { SelectValue, Value } from '../types';

const hasValue = (value: Value<SelectValue, boolean>): boolean => {
  return Array.isArray(value) ? !!value.length : !!value;
};

export default hasValue;
