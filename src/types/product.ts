export interface Product {
  readonly id: number;
  readonly title: string;
  readonly image?: string;
  readonly price: number;
  readonly newPrice?: number | null;
}
