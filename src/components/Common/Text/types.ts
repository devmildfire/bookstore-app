export type Component = 'h2' | 'h3' | 'span' | 'p' | 'a';
export type FontFamily = 'serif' | 'sans';
export type Variant =
  | Exclude<Component, 'a'>
  | 'body2'
  | 'body1'
  | 'subtitle1'
  | 'subtitle2';
export type Color = 'red' | 'white' | 'inherit';
