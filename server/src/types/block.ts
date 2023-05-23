import { RowDataPacket } from 'mysql2';

export interface Block {
  blocksize: number;
  height: number;
  id: number;
  nBits: number;
  nNonce: number;
  nTime: number;
  version: number;
  hash: string;
  txCnt: number;
  hashMerkleRoot: string;
  hashPrev: string;
}

export interface RawBlock extends RowDataPacket, Block {}

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

export interface DetailedBlockTransaction {
  inputs: BlockTransactionInput[];
  outputs: BlockTransactionOutput[];
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
  transactions: DetailedBlockTransaction[];
};
