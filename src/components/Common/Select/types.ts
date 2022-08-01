export type SelectValue = number | string;

export type OptionType<T extends SelectValue> = {
  readonly value: T;
  readonly label: string;
};

export type OnSelectValue<T extends SelectValue> = (
  option: OptionType<T>
) => void;
