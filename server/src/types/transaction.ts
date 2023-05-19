import { RowDataPacket } from 'mysql2';
import { RawBlock, Block } from './block';

interface BaseTransaction {
  id: number & { readonly __brand?: 'transactions_id' };
  lockTime: number;
  version: number;
}

export interface RawTransaction extends RowDataPacket, BaseTransaction {
  hashBlock: RawBlock['hash'];
  txid: Buffer;
}
export interface Transaction extends BaseTransaction {
  hashBlock: Block['hash'];
  txid: string;
}

export interface RawTransactionInfo extends RowDataPacket {
  blockhash: Buffer;
  curr_txid: Buffer;
  to_addr: string | null;
  to_share: number;
  to_idxout: number;
  prev_txid: Buffer;
  from_addr: string | null;
  from_idxout: number;
  amount: number;
}

export interface TransactionInfo {
  curr_txid: string;
  to_addr: string | null;
  output_amount: number;
  to_idxout: number;
  prev_txid: string;
  from_addr: string | null;
  from_idxout: number;
  input_amount: number;
}

export interface DetailedTransaction extends Transaction {
  from: {
    txid: string;
    index: number;
    address: string;
    amount: number;
  }[];
  output: { address: string; index: number; amount: number }[];
}

export type WithTransactions<T> = T & {
  txid: string;
  tx: any[];
};

export interface BlockTransactionInfo {
  coinbase: {
    to_addr: string;
    output_amount: number;
    output_idx: number;
  };
  tx: {
    txid: string;
    inputs: {
      txid: string;
      address: string;
      amount: number;
      idx: number;
    }[];
    outputs: {
      address: string;
      amount: number;
      idx: number;
    }[];
  }[];
}
