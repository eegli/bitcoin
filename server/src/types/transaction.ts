import { RowDataPacket } from 'mysql2';

// blocks/:height/ [transactions]
export interface RawBlockTransactionInfo extends RowDataPacket {
  curr_txid: string;
  prev_txid: string;
  to_addr: string | null;
  from_addr: string | null;
  output_amount: string;
  input_amount: string;
  to_idxout: number;
  from_idxout: number;
}

export interface BlockTransactionInput {
  txid: string;
  idx: number;
  address: string | null;
  amount: number;
}

export interface BlockTransactionOutput {
  address: string;
  amount: number;
  idx: number;
}

export type AddressTransactionInput = {
  address: string | null;
  amount: number;
};

export type AddressTransactionOutput = {
  address: string;
  amount: number;
};

export interface DetailedTransaction<I, O> {
  inputs: I;
  outputs: O;
  txid: string;
}

export interface CoinbaseTransaction {
  to_addr: string;
  output_amount: number;
  idx: number;
}

export type BlockTransactions = {
  coinbase: {
    txid: string;
    outputs: CoinbaseTransaction[];
  };
  transactions: DetailedTransaction<
    BlockTransactionInput[],
    BlockTransactionOutput[]
  >[];
};
