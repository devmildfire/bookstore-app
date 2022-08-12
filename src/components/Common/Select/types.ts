export type SelectValue = number | string;

export type Option<T extends SelectValue> = {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
};

export type SingleValue<T extends SelectValue> = Option<T> | null;
export type MultiValue<T extends SelectValue> = Option<T>[];
export type Value<
  T extends SelectValue,
  IsMulti extends boolean
> = IsMulti extends true ? MultiValue<T> : SingleValue<T>;

export type OnChangeValue<T extends SelectValue, IsMulti extends boolean> = (
  value: Value<T, IsMulti>
) => void;

export type Handler<T extends SelectValue> = (value: Option<T>) => void;
