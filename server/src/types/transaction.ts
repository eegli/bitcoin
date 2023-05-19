import { RowDataPacket } from 'mysql2';

export interface RawTransactionInfo extends RowDataPacket {
  block_hash: string;
  curr_txid: string;
  to_addr: string | null;
  output_amount: number;
  to_idxout: number;
  prev_txid: string;
  from_addr: string | null;
  from_idxout: number;
  input_amount: number;
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
  txid: string;
  to_addr: string;
  output_amount: number;
  idx: number;
}

export type BlockTransactionData = {
  coinbase: CoinbaseTransaction[];
  tx: DetailedTransaction[];
};
