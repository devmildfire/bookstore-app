interface GetParams {
  readonly openProduct: string;
  readonly productType: string;
  readonly publishYear: string;
  readonly author: string;
  readonly sort: string;
  readonly popup: string;
  readonly bookId: string;
}

export const GET_PARAMS: GetParams = {
  openProduct: 'op',
  author: 'at',
  productType: 'pt',
  publishYear: 'py',
  sort: 'sort',
  popup: 'pp',
  bookId: 'bki',
};
