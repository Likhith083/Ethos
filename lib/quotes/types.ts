export type Quote = {
  id: string;
  text: string;
  author: string;
};

export type ZenQuoteResponse = {
  q: string;
  a: string;
  h?: string;
};
