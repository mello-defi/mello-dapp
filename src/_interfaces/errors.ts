interface EthereumTransactionErrorData {
  code: number;
  message: string;
  data: any;
}

export interface EthereumTransactionError extends Error {
  code: number;
  message: string;
  data?: EthereumTransactionErrorData;
}
