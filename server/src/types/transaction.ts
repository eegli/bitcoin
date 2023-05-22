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

export interface TransactionInput {
  txid: string;
  idx: number;
  address: string;
  amount: number;
}

export interface TransactionOutput {
  address: string;
  idx: number;
  amount: number;
}

export interface DetailedTransaction {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  txid: string;
}

export interface CoinbaseTransaction {
  to_addr: string;
  output_amount: number;
  idx: number;
}

export type BlockTransactionData = {
  coinbase: {
    txid: string;
    outputs: CoinbaseTransaction[];
  };
  tx: DetailedTransaction[];
};
