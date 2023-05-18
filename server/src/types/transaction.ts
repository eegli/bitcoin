import { RowDataPacket } from 'mysql2';
import { RawBlock, Block } from './block';

interface BaseTransaction extends RowDataPacket {
  id: number & { readonly __brand?: 'transactions_id' };
  lockTime: number;
  version: number;
}

export interface RawTransaction extends BaseTransaction {
  hashBlock: RawBlock['hash'];
  txid: Buffer;
}
export interface Transaction extends BaseTransaction {
  hashBlock: Block['hash'];
}
