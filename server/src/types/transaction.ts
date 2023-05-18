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

export type WithTransactions<T> = T & {
  txids: string[];
};
